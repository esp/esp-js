import {concat, ConnectableObservable, Observable, ReplaySubject, Subscriber} from 'rxjs';
import {map, multicast} from 'rxjs/operators';
import {DefaultPrerequisiteRegister, LoadResult, ResultStage} from './prerequisites';
import {Container} from 'esp-js-di';
import {ModuleChangeType, ModuleLoadResult, ModuleLoadStage} from './moduleLoadResult';
import {ViewRegistryModel} from '../viewFactory';
import {Module, ModuleConstructor} from './module';
import {ModuleMetadata} from './moduleDecorator';
import {SystemContainerConst} from '../dependencyInjection';
import {DisposableBase, Health, HealthIndicator, Logger} from 'esp-js';
import {MetricFactory} from 'esp-js-metrics';

export interface SingleModuleLoader {
    readonly moduleMetadata: ModuleMetadata;
    readonly lastModuleLoadResult: ModuleLoadResult;
    readonly loadResults: Observable<ModuleLoadResult>;
    readonly hasLoaded: boolean;
}

const moduleLoadedCounter = MetricFactory.createCounter('esp_module_loaded', 'Counts when an esp module has fully loaded', ['module_key']);

/**
 * Owns load orchestrations for a module.
 *
 * Exposes a loadResults for streaming updates of the modules load status, kick the stream off by calling load().
 *
 * This loader gets added to the modules container so other areas of the module can get read only access to it.
 */
export class DefaultSingleModuleLoader extends DisposableBase implements SingleModuleLoader, HealthIndicator {
    private readonly _preReqsLoader: DefaultPrerequisiteRegister;
    private _log: Logger;
    private _module: Module;
    private _loadStream: ConnectableObservable<ModuleLoadResult>;
    private _lastModuleLoadResult: ModuleLoadResult;
    private _connected = false;
    private _healthIndicatorName: string;
    private _health: Health;

    public constructor(
        private _container: Container,
        private _viewRegistryModel: ViewRegistryModel,
        private _moduleMetadata: ModuleMetadata,
        private _moduleConstructor: ModuleConstructor,
    ) {
        super();
        let name = `SingleModuleLoader-${this._moduleMetadata.moduleKey}`;
        this._log = Logger.create(name);
        this._healthIndicatorName = name;
        this._health = Health.builder(name).isUnknown().build();
        this._preReqsLoader = new DefaultPrerequisiteRegister();
        this._loadStream = <ConnectableObservable<ModuleLoadResult>>this._createLoadStream().pipe(multicast(new ReplaySubject<ModuleLoadResult>(1)));
    }

    public get healthIndicatorName(): string {
        return this._healthIndicatorName;
    }

    public health() : Health {
        return this._health;
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
    public get loadResults(): Observable<ModuleLoadResult> {
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

    private _createLoadStream(): Observable<ModuleLoadResult> {
        return new Observable((obs: Subscriber<ModuleLoadResult>) => {
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
                this._log.verbose(`Creating loader for module ${moduleName}`);

                let childContainer = this._container.createChildContainer();

                // as this stream is ultimately published and tied to this class we can register the loader so other parts of the module can check the load status.
                childContainer.registerInstance(SystemContainerConst.single_module_loader, this);

                this._module = new this._moduleConstructor(childContainer);

                this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);

                this._log.verbose(`Configuring Container for ${moduleName}`);
                this.module.configureContainer();

                this._log.verbose(`Registering Components for ${moduleName}`);
                this.module.registerViewFactories(this._viewRegistryModel);

                this._log.verbose(`Registering prereqs for ${moduleName}`);
                this.module.registerPrerequisites(this._preReqsLoader);
            } catch (e) {
                let errorMessage = `Failed to create module ${moduleName}`;
                this._log.error(errorMessage, e);
                this._health = Health.builder(this._healthIndicatorName).isUnhealthy().addReason(errorMessage).build();
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
                this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);
                obs.next(this._lastModuleLoadResult);
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
            this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);
            obs.next(this._lastModuleLoadResult);

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

    private _buildInitStream(module: Module): Observable<ModuleLoadResult> {
        return new Observable((obs: Subscriber<ModuleLoadResult>) => {
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
                this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);
                obs.next(this._lastModuleLoadResult);
                module.initialise();
            } catch (e) {
                let errorMessage = `Failed to initialise module ${this._moduleMetadata.moduleName}`;
                this._log.error(errorMessage, e);
                this._health = Health.builder(this._healthIndicatorName).isUnhealthy().addReason(errorMessage).build();
                this._lastModuleLoadResult = Object.freeze({
                    type: ModuleChangeType.Error,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    errorMessage: `Module initialisation failed`,
                    hasCompletedLoaded: false,
                    stage: ModuleLoadStage.Initialising
                });
                this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);
                obs.next(this._lastModuleLoadResult);
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
            this._health = Health.builder(this._healthIndicatorName).isHealthy().build();
            moduleLoadedCounter.inc({module_key: this._moduleMetadata.moduleKey });
            this._module.onLoadStageChanged(this._lastModuleLoadResult.stage);
            obs.next(this._lastModuleLoadResult);
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