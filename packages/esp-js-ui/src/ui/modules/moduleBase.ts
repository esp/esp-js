import {Container} from 'esp-js-di';
import {DisposableBase, Guard} from 'esp-js';
import {ViewRegistryModel, ViewFactoryBase} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';
import {Module} from './module';
import {ModelBase} from '../modelBase';
import {ModuleMetadata} from './moduleDecorator';
import {EspModuleDecoratorUtils} from './moduleDecorator';
import {Logger} from '../../core';
import {RegionManager} from '../regions/models';
import {SystemContainerConst} from '../dependencyInjection';
import {ModuleLoadStage} from './moduleLoadResult';

const _log: Logger = Logger.create('ModuleBase');

export abstract class ModuleBase extends DisposableBase implements Module {
    private readonly _moduleMetadata: ModuleMetadata;

    /**
     * Creates the module.
     * @param container A child container of the applications root container.
     */
    protected constructor(public readonly container: Container) {
        super();
        Guard.isDefined(container, 'container must be defined');
        // seems to make sense for the module to own it's container,
        // disposing the module will dispose it's container and thus all it's child components.
        this.addDisposable(container);
        this._moduleMetadata = EspModuleDecoratorUtils.getMetadataFromModuleInstance(this);
        container.registerInstance(SystemContainerConst.module_metadata, this._moduleMetadata);
    }

    protected get moduleMetadata(): ModuleMetadata {
        return this._moduleMetadata;
    }

    /**
     * The application's RegionManager
     *
     * This is provides as a convenience as many modules will likely use this to add views to regions.
     */
    protected get regionManager(): RegionManager {
        return this.container.resolve<RegionManager>(SystemContainerConst.region_manager);
    }

    initialise(): void { }

    abstract configureContainer();

    abstract registerPrerequisites(register: PrerequisiteRegister): void;

    protected abstract get isOnNewStateApi(): boolean;

    registerViewFactories(viewRegistryModel: ViewRegistryModel) {
        // If an old derived type of this class is loaded, it won't have overrode isOnNewStateApi, thus we can infer that module is legacy
        const isOnNewStateApi = !!this.isOnNewStateApi;
        const isLegacyModule = !isOnNewStateApi;
        _log.debug('Registering ViewFactories');
        let viewFactories: Array<ViewFactoryBase<any, any>> = this.getViewFactories();
        viewFactories.forEach(viewFactory => {
            viewRegistryModel.registerViewFactory(this._moduleMetadata.moduleKey, this._moduleMetadata.moduleName, viewFactory, this.container, isLegacyModule);
            this.addDisposable(() => {
                viewRegistryModel.unregisterViewFactory(viewFactory);
            });
        });
    }

    getViewFactories(): Array<ViewFactoryBase<ModelBase, any>> {
        return [];
    }

    onLoadStageChanged(stage: ModuleLoadStage) {
    }
}