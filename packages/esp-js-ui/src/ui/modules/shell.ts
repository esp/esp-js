import {StateSaveMonitor, StateService} from '../state';
import {Container} from 'esp-js-di';
import {Logger} from '../../core';
import {SystemContainerConfiguration, SystemContainerConst} from '../dependencyInjection';
import {EspModuleDecoratorUtils} from './moduleDecorator';
import {RegionBase, RegionManager, RegionState} from '../regions/models';
import {AppDefaultStateProvider, AppState, NoopAppDefaultStateProvider} from './appState';
import {IdFactory} from '../idFactory';
import * as Rx from 'rx';
import {AggregateModuleLoadResult, ModuleLoadResult, ModuleLoadStage} from './moduleLoadResult';
import {DisposableBase, Guard, Router} from 'esp-js';
import {Module, ModuleConstructor} from './module';
import {ViewFactoryBase, ViewRegistryModel} from '../viewFactory';
import {DefaultSingleModuleLoader} from './singleModuleLoader';
import {ModuleProvider} from './moduleProvider';
import {ModelBase} from '../modelBase';

const _log: Logger = Logger.create('Shell');

export abstract class Shell extends DisposableBase implements ModuleProvider {
    public static readonly ShellModuleKey = 'shell-module';
    private _container: Container;
    private _stateSaveMonitor: StateSaveMonitor;
    private _moduleLoaders: DefaultSingleModuleLoader[] = [];
    private _shellLoaderModelId = IdFactory.createId('module-loader');
    private _connected = false;
    private _regionsLoaded = false;
    private _loadStreamSubscription = new Rx.SerialDisposable();
    private _moduleLoadResultsSubject = new Rx.ReplaySubject(1);
    private _aggregateModuleLoadResult = AggregateModuleLoadResult.EMPTY;
    private _stateSaveMonitorDisposable = new Rx.SerialDisposable();
    private _regionManager: RegionManager;
    private _viewRegistryModel: ViewRegistryModel;
    private _router: Router;
    private _stateService: StateService;

    public constructor() {
        super();
        // This is somewhat of a hack to avoid a race condition whereby modules that load very quickly don't allow the view registry model to process the new view factories before the modules loadLayout is called.
        // Effectively loadLayout is called right away and it can't find any of the 'enqueued to be registered' view factories.
        // The below 'ghost model' is used to pop the load layout call onto the back of the dispatch loop which will allow the router to train all other models and thus populate the view factories.
        // The proper fix for this is to make the ModuleLoader a true esp model, however I don't want to do that in the 2.0 code base as it's using the older version of rx.
        // I think this is a likely refactor for esp 4.
        this._container = new Container();
        this.addDisposable(this._stateSaveMonitorDisposable);
    }

    public get container(): Container {
        return this._container;
    }

    /**
     * if true automatic state saving for all the modules models using the provided StateService will apply
     */
    public get stateSavingEnabled(): boolean {
        return false;
    }

    /**
     * The interval at which state will be saved
     */
    public get stateSaveIntervalMs(): number {
        return 60_000;
    }

    public getDefaultStateProvider(): AppDefaultStateProvider {
        return NoopAppDefaultStateProvider;
    }

    public get appStateKey(): string {
        return 'esp-app-state';
    }

    public get moduleLoadResults(): Rx.Observable<AggregateModuleLoadResult> {
        return this._moduleLoadResultsSubject.asObservable();
    }

    protected configureContainer() {

    }

    public getModule(moduleKey: string): Module {
        const moduleLoader = this._moduleLoaders.find(ml => ml.moduleMetadata.moduleKey === moduleKey);
        return moduleLoader ? moduleLoader.module : null;
    }

    public start() {
        SystemContainerConfiguration.configureContainer(this._container);
        this._container.registerInstance(SystemContainerConst.app_shell, this);
        this._container.registerInstance(SystemContainerConst.module_provider, this);
        this._router = this._container.resolve<Router>(SystemContainerConst.router);
        this._router.addModel(this._shellLoaderModelId, {});
        this._regionManager = this._container.resolve<RegionManager>(SystemContainerConst.region_manager);
        this._viewRegistryModel = this._container.resolve<ViewRegistryModel>(SystemContainerConst.views_registry_model);
        this.configureContainer();
        this._stateService = this._container.resolve<StateService>(SystemContainerConst.state_service);
        this._registerShellViewFactories();
    }

    /**
     * takes an array of modules class that will be new-ed up, i.e. constructor functions
     */
    public load(...moduleConstructors: Array<ModuleConstructor>): void {
        if (!this._connected) {
            // Using a subject and handling the 'publish/connect' manually here as we can't create the stream at ctor time and need to expose something via .loadResults, hence the subject.
            this._connected = true;
            this._aggregateModuleLoadResult = new AggregateModuleLoadResult(moduleConstructors.length);
            if (moduleConstructors.length === 0) {
                this._moduleLoadResultsSubject.onNext(this._aggregateModuleLoadResult);
                this._onModuleLoadComplete();
                return;
            }
            const stream = this._createLoadStream(...moduleConstructors);
            this._loadStreamSubscription.setDisposable(stream.subscribe(
                r => {
                    this._aggregateModuleLoadResult = this._aggregateModuleLoadResult.addModuleLoadResult(r);
                    if (!this._regionsLoaded && this._aggregateModuleLoadResult.allModulesAtOrLaterThanStage(ModuleLoadStage.Registered)) {
                        this._onModuleLoadComplete();
                    }
                    this._moduleLoadResultsSubject.onNext(this._aggregateModuleLoadResult);
                },
                exception => {
                    _log.error(`Error on module load stream`, exception);
                }
            ));
        }
    }

    private _registerShellViewFactories() {
        _log.debug('Registering Shell ViewFactories');
        let viewFactories: Array<ViewFactoryBase<any, any>> = this.getViewFactories();
        viewFactories.forEach(viewFactory => {
            this._viewRegistryModel.registerViewFactory(Shell.ShellModuleKey, 'Shell', viewFactory, this.container, false);
            this.addDisposable(() => {
                this._viewRegistryModel.unregisterViewFactory(viewFactory);
            });
        });
    }

    getViewFactories(): Array<ViewFactoryBase<ModelBase, any>> {
        return [];
    }

    private _onModuleLoadComplete() {
        this._router.runAction(this._shellLoaderModelId, () => {
            if (!this._regionsLoaded) {
                this._loadRegions();
                this._trySetStateSaveMonitor();
            }
        });
    }

    // TODO a crap load of tests to ensure a shell can be loaded and unloaded and everything is started/disposed correctly
    // TODO reentrancy check
    public unloadModules(): void {
        _log.debug(`'Unloading all modules`);
        this.trySaveAllComponentState();
        this._unloadRegions();
        this._moduleLoaders.forEach(moduleLoader => {
            _log.debug(`'Unloading module ${moduleLoader.moduleMetadata.moduleKey} with name ${moduleLoader.moduleMetadata.moduleName}`);
            moduleLoader.disposeModule();
        });
        this._stateSaveMonitorDisposable.setDisposable(null);
        this._loadStreamSubscription.setDisposable(null);
        this._moduleLoaders.length = 0;
        this._connected = false;
        this._regionsLoaded = false;
        this._aggregateModuleLoadResult = AggregateModuleLoadResult.EMPTY;
        this._moduleLoadResultsSubject.onNext(this._aggregateModuleLoadResult);
    }

    /**
     * While state saving happens automatically based on stateSavingEnabled & stateSaveIntervalMs, you can also force it via this function.
     */
    public trySaveAllComponentState = () => {
        if (!this.stateSavingEnabled) {
            return;
        }
        if (!this._regionsLoaded) {
            return;
        }
        let appState: AppState = { regionState: [] };
        this._regionManager.getRegions().forEach((region: RegionBase<any>) => {
            if (!region.stateSavingEnabled) {
                return;
            }
            let regionState: RegionState = region.getRegionState();
            if (regionState) {
                appState.regionState.push(regionState);
            }
        });
        if (appState.regionState.length > 0) {
            this._stateService.saveState(this.appStateKey, appState);
        } else {
            this._stateService.clearState(this.appStateKey);
        }
    };

    private _loadRegions() {
        Guard.isTruthy(this._connected, `_loadRegions but we're not connected`);
        _log.debug(`Loading Regions`);
        if (this._regionsLoaded) {
            _log.debug(`First unloading existing views`);
            this._unloadRegions();
        }
        this._regionsLoaded = true;
        let applicationState: AppState = this._stateService.getState<AppState>(this.appStateKey);
        if (!applicationState) {
            applicationState = this.getDefaultStateProvider().getDefaultAppState();
        }
        if (applicationState && applicationState.regionState.length > 0) {
            applicationState.regionState.forEach(regionState => {
                this._regionManager.loadRegion(regionState);
            });
        }
    }

    private _unloadRegions() {
        this._regionManager.getRegions().forEach((region: RegionBase<any>) => {
            region.unload();
        });
    }

    private _createLoadStream(...moduleConstructors: Array<ModuleConstructor>): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            _log.debug(`Loading shell and ${moduleConstructors.length} additional modules`);
            return Rx.Observable
                .merge([...moduleConstructors.map(moduleCtor => this._loadModule(moduleCtor))])
                .subscribe(obs);
        });
    }

    private _loadModule(moduleConstructor: ModuleConstructor): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            let moduleMetadata = EspModuleDecoratorUtils.getMetadataFromModuleClass(moduleConstructor);
            _log.debug(`Creating module loader for ${moduleMetadata.moduleKey}`);
            let moduleLoader = new DefaultSingleModuleLoader(
                this._container,
                this._viewRegistryModel,
                moduleMetadata,
                moduleConstructor,
            );
            this._moduleLoaders.push(moduleLoader);
            let subscription = moduleLoader.loadResults.subscribe(obs);
            moduleLoader.load();
            return subscription;
        });
    }

    private _trySetStateSaveMonitor() {
        if (this.stateSavingEnabled && this.stateSaveIntervalMs > 0) {
            let stateSaveMonitor = new StateSaveMonitor(this.stateSaveIntervalMs, this.trySaveAllComponentState);
            this._stateSaveMonitor = stateSaveMonitor;
            this._stateSaveMonitorDisposable.setDisposable(this._stateSaveMonitor);
            stateSaveMonitor.start();
        }
    }
}