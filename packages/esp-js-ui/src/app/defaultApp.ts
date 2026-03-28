import {App} from './types';
import {Container} from 'esp-js-di';
import {Module, ModuleFactory, ModuleLoadResult, ModuleOrFactory} from '../modules';
import {EventBus, Logger} from 'esp-js';
import {AppBuilderState} from './appBuilder';

const _log = Logger.create('App');

export class DefaultApp implements App {
    public readonly appName: string;
    private _container: Container = new Container();
    private _moduleEntries: ModuleOrFactory[];
    private _configureContainerFns: Array<(container: Container) => void>;
    private _initialiseFns: Array<(app: App) => Promise<void>>;
    private _startFns: Array<(app: App) => Promise<void>>;
    private _modules: Module[] | null = null;
    private _disposed: boolean = false;
    private _started: boolean = false;
    private _eventBus: EventBus = new EventBus();

    constructor(state: AppBuilderState) {
        this.appName = state.appName;
        this._configureContainerFns = [...state.configureContainerFns];
        this._moduleEntries = [...state.moduleEntries];
        this._initialiseFns = [...state.initialiseFns];
        this._startFns = [...state.startFns];
    }

    public get container(): Container {
        return this._container;
    }

    public get eventBus(): EventBus {
        return this._eventBus;
    }

    public get modules(): ReadonlyArray<Module> {
        return this._modules ?? [];
    }

    async start(): Promise<void> {
        if (this._started) {
            return;
        }
        this._started = true;
        this._configureContainer()
        await this._loadModules();
        this._configureModuleContainers()
        await this._initialiseModules();
        await this._doStart(this._modules);
    }

    private _configureContainer(): void {
        this.container.registerInstance('bus', this._eventBus);
        for (const fn of this._configureContainerFns) {
            fn(this.container);
        }
    }

    private _configureModuleContainers() {
        for (const module of this._modules) {
            module.configureContainer(this.container);
        }
    }

    private async _loadModules(): Promise<ReadonlyArray<Module>> {
        if (this._modules !== null) {
            return this._modules;
        }
        _log.info(`App [${this.appName}] loading modules`);
        const resolved = await Promise.all(
            this._moduleEntries.map(entry =>
                typeof entry === 'function'
                    ? (entry as ModuleFactory)()
                    : Promise.resolve(entry)
            )
        );
        this._modules = resolved;
        _log.info(`App [${this.appName}] loaded ${resolved.length} module(s)`);
        return this._modules;
    }

    private async _initialiseModules(): Promise<ReadonlyArray<ModuleLoadResult>> {
        _log.info(`App [${this.appName}] running app-level initialisation hooks`);
        for (const fn of this._initialiseFns) {
            await fn(this);
        }
        _log.info(`App [${this.appName}] initialising ${this._modules.length} module(s)`);
        const results = await Promise.allSettled(this._modules.map(m => m.initialise(this)));
        return results.map((result, i) => {
            if (result.status === 'fulfilled') {
                return {moduleId: this._modules[i].moduleId, status: 'success' as const};
            }
            const err = result.reason instanceof Error ? result.reason : new Error(String(result.reason));
            _log.error(`Module [${this._modules[i].moduleId}] initialise() failed: ${err.message}`);
            return {moduleId: this._modules[i].moduleId, status: 'error' as const, error: err};
        });
    }

    private async _doStart(modules: Module[]): Promise<void> {
        _log.info(`App [${this.appName}] starting ${modules.length} module(s)`);
        const results = await Promise.allSettled(modules.map(m => m.start(this)));
        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                return;
            }
            const err = result.reason instanceof Error ? result.reason : new Error(String(result.reason));
            _log.error(`Module [${modules[i].moduleId}] start() failed: ${err.message}`);
        });
        _log.info(`App [${this.appName}] running app-level start hooks`);
        for (const fn of this._startFns) {
            await fn(this);
        }
    }

    dispose(): void {
        if (this._disposed || this._modules === null) {
            return;
        }
        this._disposed = true;
        const reversed = [...this._modules].reverse();
        for (const module of reversed) {
            try {
                module.dispose();
            } catch (e) {
                _log.error(`Error disposing module [${module.moduleId}]: ${e}`);
            }
        }
    }
}