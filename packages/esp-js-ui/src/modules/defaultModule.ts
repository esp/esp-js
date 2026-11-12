import {Module, ModuleContext, ModuleHook, ModuleViewBinding} from './types';
import type {Container} from 'esp-js-di';
import {Logger} from 'esp-js';
import { ModuleBuilderState } from './moduleBuilder';
import {App} from '../app';

const _log = Logger.create('Module');

export class DefaultModule implements Module {
    public readonly moduleId: string;
    public readonly viewBindings: ReadonlyArray<ModuleViewBinding>;

    private _containerConfigurators: Array<(container: Container) => void>;
    private _initialiseFns: ModuleHook[];
    private _startFns: ModuleHook[];
    private _childContainer: Container | null = null;
    private _disposed: boolean = false;

    constructor(state: ModuleBuilderState) {
        this.moduleId = state.moduleId;
        this.viewBindings = Object.freeze([...state.viewBindings]);
        this._containerConfigurators = [...state.containerConfigurators];
        this._initialiseFns = [...state.initialiseFns];
        this._startFns = [...state.startFns];
    }

    configureContainer(container: Container): void {
        if (this._childContainer !== null) {
            _log.warn(`configureContainer called again on module [${this.moduleId}] — disposing previous child container`);
            this._childContainer.dispose();
        }
        this._childContainer = container;
        for (const fn of this._containerConfigurators) {
            fn(container);
        }
        _log.debug(`Module [${this.moduleId}] container configured`);
    }

    async initialise(app: App): Promise<void> {
        _log.debug(`Module [${this.moduleId}] initialising`);
        const context = this._createContext(app);
        for (const fn of this._initialiseFns) {
            await fn(context);
        }
        _log.debug(`Module [${this.moduleId}] initialised`);
    }

    async start(app: App): Promise<void> {
        _log.debug(`Module [${this.moduleId}] starting`);
        const context = this._createContext(app);
        for (const fn of this._startFns) {
            await fn(context);
        }
        _log.debug(`Module [${this.moduleId}] started`);
    }

    private _createContext(app: App): ModuleContext {
        if (this._childContainer === null) {
            throw new Error(`Module [${this.moduleId}] has no container. configureContainer() must be called before initialise()/start()`);
        }
        return {app, moduleContainer: this._childContainer, eventBus: app.eventBus};
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        if (this._childContainer !== null) {
            _log.debug(`Module [${this.moduleId}] disposing child container`);
            this._childContainer.dispose();
            this._childContainer = null;
        }
    }
}