import {concat, Observable, Subscriber} from 'rxjs';
import {map} from 'rxjs/operators';
import {DefaultPrerequisiteRegister, LoadResult, ResultStage} from './prerequisites';
import {Container} from 'esp-js-di';
import {ModuleChangeType, ModuleLoadResult, ModuleLoadStage} from './moduleLoadResult';
import {ViewRegistryModel} from '../viewFactory';
import {Module, ModuleConstructor} from './module';
import {ModuleMetadata} from './moduleDecorator';
import {SystemContainerConst} from '../dependencyInjection';
import {DisposableBase, Logger} from 'esp-js';

export interface SingleModuleLoader {
    readonly moduleMetadata: ModuleMetadata;
    readonly lastModuleLoadResult: ModuleLoadResult;
    readonly loadResults: Rx.Observable<ModuleLoadResult>;
    readonly hasLoaded: boolean;
}

/**
 * Owns load orchestrations for a module.
 *
 * Exposes a loadResults for streaming updates of the modules load status, kick the stream off by calling load().
 *
 * This loader gets added to the modules container so other areas of the module can get read only access to it.
 */
export class DefaultSingleModuleLoader extends DisposableBase implements SingleModuleLoader {
    private readonly _preReqsLoader: DefaultPrerequisiteRegister;
    private _log: Logger;
    private _module: Module;
    private _loadStream: Rx.ConnectableObservable<ModuleLoadResult>;
    private _lastModuleLoadResult: ModuleLoadResult;
    private _connected = false;

    public constructor(
        private _container: Container,
        private _viewRegistryModel: ViewRegistryModel,
        private _moduleMetadata: ModuleMetadata,
        private _moduleConstructor: ModuleConstructor,
    ) {
        super();
        this._log = Logger.create(`SingleModuleLoader-${this._moduleMetadata.moduleKey}`);
        this._preReqsLoader = new DefaultPrerequisiteRegister();
        this._loadStream = this._createLoadStream().multicast(new Rx.ReplaySubject<ModuleLoadResult>(1));
    }

    public get module(): Module {
        return this._module;
    }

    public get moduleMetadata(): ModuleMetadata {
        return this._moduleMetadata;
    }

    public get lastModuleLoadResult(): ModuleLoadResult {
        return this._lastModuleLoadResult;
    }

    /**
     * A publish stream of ModuleLoadResults
     */
    public get loadResults(): Rx.Observable<ModuleLoadResult> {
        return this._loadStream;
    }

    public get hasLoaded() {
        return this._lastModuleLoadResult && this._lastModuleLoadResult.stage === ModuleLoadStage.Loaded;
    }

    /**
     * Kicks off the published loadResults
     */
    public load(): void {
        if (!this._connected) {
            this._connected = true;
            this.addDisposable(this._loadStream.connect());
        }
    }

    private _createLoadStream(): Rx.Observable<ModuleLoadResult> {
        return new Observable((obs: Rx.Subscriber<ModuleLoadResult>) => {
            let moduleName = this._moduleMetadata.moduleName;
            let moduleKey = this._moduleMetadata.moduleKey;

            this._lastModuleLoadResult = Object.freeze({
                type: ModuleChangeType.Change,
                moduleName: moduleName,
                moduleKey,
                description: `Module loading`,
                hasCompletedLoaded: false,
                stage: ModuleLoadStage.Loading
            });
            obs.next(this._lastModuleLoadResult);

            try {
                this._log.debug(`Creating module ${moduleName}`);

                let childContainer = this._container.createChildContainer();

                // as this stream is ultimately published and tied to this class we can register the loader so other parts of the module can check the load status.
                childContainer.registerInstance(SystemContainerConst.single_module_loader, this);

                this._module = new this._moduleConstructor(childContainer);

                this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);

                this._log.debug(`Configuring Container for ${moduleName}`);
                this.module.configureContainer();

                this._log.debug(`Registering Components for ${moduleName}`);
                this.module.registerViewFactories(this._viewRegistryModel);

                this._log.debug(`Registering prereqs for ${moduleName}`);
                this.module.registerPrerequisites(this._preReqsLoader);
            } catch (e) {
                this._log.error(`Failed to create module ${moduleName}`, e);
                this._lastModuleLoadResult = Object.freeze({
                    type: ModuleChangeType.Error,
                    moduleName,
                    moduleKey,
                    errorMessage: `Module load failed`,
                    prerequisiteResult: {
                        stage: ResultStage.Error,
                        name: `Module bootstrapping`,
                        errorMessage: `Failed to load module ${moduleName}`
                    },
                    hasCompletedLoaded: false,
                    stage: ModuleLoadStage.Loading
                });
                obs.next(this._lastModuleLoadResult);
                this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);
                obs.complete();
                return () => {
                };
            }

            this._lastModuleLoadResult = Object.freeze({
                type: ModuleChangeType.Change,
                moduleName: moduleName,
                moduleKey,
                description: `Module Configurations Registered`,
                hasCompletedLoaded: false,
                stage: ModuleLoadStage.Registered
            });
            obs.next(this._lastModuleLoadResult);
            this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);

            let initStream = this._buildInitStream(this.module);

            let preReqsStream = this._preReqsLoader
                .load()
                .pipe(
                    map((result: LoadResult) => this._mapPreReqsLoadResult(result))
                );
            return concat(preReqsStream, initStream).subscribe(obs);
        });
    }

    public disposeModule(): void {
        if (!this.module) {
            return;
        }
        this.module.dispose();
    }

    private _buildInitStream(module: Module): Rx.Observable<ModuleLoadResult> {
        return new Observable((obs: Rx.Subscriber<ModuleLoadResult>) => {
            try {
                // We yield an "Initialising" change, just in case the .initialise() call 
                // is blocking and halts the UI for a while. We don't control the module
                // so we'd rather let consumers know where it's stuck
                this._lastModuleLoadResult = Object.freeze({
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    description: `Module initialising`,
                    hasCompletedLoaded: false,
                    stage: ModuleLoadStage.Initialising
                });
                obs.next(this._lastModuleLoadResult);
                this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);
                module.initialise();
            } catch (e) {
                this._log.error(`Failed to initialise module ${this._moduleMetadata.moduleName}`, e);
                this._lastModuleLoadResult = Object.freeze({
                    type: ModuleChangeType.Error,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    errorMessage: `Module initialisation failed`,
                    hasCompletedLoaded: false,
                    stage: ModuleLoadStage.Initialising
                });
                obs.next(this._lastModuleLoadResult);
                this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);
                obs.complete();
                return () => {
                };
            }
            this._lastModuleLoadResult = Object.freeze({
                type: ModuleChangeType.Change,
                moduleName: this._moduleMetadata.moduleName,
                moduleKey: this._moduleMetadata.moduleKey,
                description: `Module initialised`,
                hasCompletedLoaded: true,
                stage: ModuleLoadStage.Loaded
            });
            obs.next(this._lastModuleLoadResult);
            this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);
            obs.complete();
        });
    }

    private _mapPreReqsLoadResult(result: LoadResult): ModuleLoadResult {
        switch (result.stage) {
            case ResultStage.Starting:
                return Object.freeze({
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    description: `${result.name} Starting`,
                    prerequisiteResult: result,
                    hasCompletedLoaded: false,
                    stage: ModuleLoadStage.Prerequisites
                });
            case ResultStage.Completed:
                return Object.freeze({
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    description: `${result.name} Finished`,
                    prerequisiteResult: result,
                    hasCompletedLoaded: false,
                    stage: ModuleLoadStage.Prerequisites
                });
            case ResultStage.Error:
                return Object.freeze({
                    type: ModuleChangeType.Error,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    errorMessage: result.errorMessage,
                    prerequisiteResult: result,
                    hasCompletedLoaded: false,
                    stage: ModuleLoadStage.Prerequisites
                });
            default:
                let errorMessage = `Unknown stage from the pre-req loader for ${this._moduleMetadata.moduleName} key ${this._moduleMetadata.moduleKey}.`;
                this._log.error(errorMessage, result);
                throw new Error(errorMessage);
        }
    }
}