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
        if (this._disposed) {
            throw new Error(`App [${this.appName}] has been disposed and can not be started`);
        }
        if (this._started) {
            return;
        }
        this._started = true;
        this._configureContainer();
        await this._loadModules();
        if (this._abortIfDisposed('loading modules')) {
            return;
        }
        this._configureModuleContainers();
        const initResults = await this._initialiseModules();
        if (this._abortIfDisposed('initialising modules')) {
            return;
        }
        // Only start modules that initialised; a module whose initialise() failed is left out (its failure was logged).
        await this._doStart(this._modules.filter((_, i) => initResults[i].status === 'success'));
    }

    private _abortIfDisposed(stage: string): boolean {
        if (this._disposed) {
            _log.warn(`App [${this.appName}] was disposed while ${stage}, start() aborted`);
            return true;
        }
        return false;
    }

    private _configureContainer(): void {
        this.container.registerInstance('bus', this._eventBus);
        for (const fn of this._configureContainerFns) {
            fn(this.container);
        }
    }

    private _configureModuleContainers() {
        for (const module of this._modules) {
            // Each module gets its own child container: it can see root registrations, but not other modules' registrations.
            module.configureContainer(this.container.createChildContainer());
        }
    }

    private async _loadModules(): Promise<ReadonlyArray<Module>> {
        if (this._modules !== null) {
            return this._modules;
        }
        _log.info(`App [${this.appName}] loading modules`);
        // A lazy module factory can fail (e.g. a code-split chunk fails to load). Like initialise/start failures,
        // that's isolated: the failure is logged and the app carries on with the modules that loaded.
        const results = await Promise.allSettled(
            this._moduleEntries.map(entry =>
                typeof entry === 'function'
                    ? (entry as ModuleFactory)()
                    : Promise.resolve(entry)
            )
        );
        const resolved: Module[] = [];
        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                resolved.push(result.value);
            } else {
                const err = result.reason instanceof Error ? result.reason : new Error(String(result.reason));
                _log.error(`App [${this.appName}] failed to load module at index [${i}], it will be skipped: ${err.message}`);
            }
        });
        if (this._disposed) {
            // disposed while lazy modules were loading, dispose what loaded as they'll never be tracked.
            resolved.forEach(m => this._tryDisposeModule(m));
            return resolved;
        }
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

    /**
     * Disposes modules (reverse load order), then the EventBus, then the root container.
     */
    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        if (this._modules !== null) {
            const reversed = [...this._modules].reverse();
            for (const module of reversed) {
                this._tryDisposeModule(module);
            }
        }
        try {
            this._eventBus.dispose();
        } catch (e) {
            _log.error(`Error disposing EventBus for app [${this.appName}]: ${e}`);
        }
        try {
            this._container.dispose();
        } catch (e) {
            _log.error(`Error disposing root container for app [${this.appName}]: ${e}`);
        }
    }

    private _tryDisposeModule(module: Module) {
        try {
            module.dispose();
        } catch (e) {
            _log.error(`Error disposing module [${module.moduleId}]: ${e}`);
        }
    }
}
