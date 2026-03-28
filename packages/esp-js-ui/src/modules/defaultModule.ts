import {Module, ModuleViewBinding} from './types';
import type {Container} from 'esp-js-di';
import {Logger} from 'esp-js';
import { ModuleBuilderState } from './moduleBuilder';
import {App} from '../app';

const _log = Logger.create('Module');

export class DefaultModule implements Module {
    public readonly moduleId: string;
    public readonly viewBindings: ReadonlyArray<ModuleViewBinding>;

    private _containerConfigurators: Array<(container: Container) => void>;
    private _initialiseFns: Array<(app: App) => Promise<void>>;
    private _startFns: Array<(app: App) => Promise<void>>;
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
            _log.warn('configureContainer called again on module [{0}] — disposing previous child container', this.moduleId);
            this._childContainer.dispose();
        }
        this._childContainer = container;
        for (const fn of this._containerConfigurators) {
            fn(container);
        }
        _log.debug('Module [{0}] container configured', this.moduleId);
    }

    async initialise(app: App): Promise<void> {
        _log.debug('Module [{0}] initialising', this.moduleId);
        for (const fn of this._initialiseFns) {
            await fn(app);
        }
        _log.debug('Module [{0}] initialised', this.moduleId);
    }

    async start(app: App): Promise<void> {
        _log.debug('Module [{0}] starting', this.moduleId);
        for (const fn of this._startFns) {
            await fn(app);
        }
        _log.debug('Module [{0}] started', this.moduleId);
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        if (this._childContainer !== null) {
            _log.debug('Module [{0}] disposing child container', this.moduleId);
            this._childContainer.dispose();
            this._childContainer = null;
        }
    }
}