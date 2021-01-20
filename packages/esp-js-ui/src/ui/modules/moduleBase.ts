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
    protected constructor(protected readonly container: Container) {
        super();
        Guard.isDefined(container, 'container must be defined');
        // seems to make sense for the module to own it's container,
        // disposing the module will dispose it's container and thus all it's child components.
        this.addDisposable(container);
        this._moduleMetadata = EspModuleDecoratorUtils.getMetadataFromModuleInstance(this);
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

    registerViewFactories(viewRegistryModel: ViewRegistryModel) {
        // If a legacy module is loaded dynamically using this base class, we can detect so by seeing if an old/deleted property exists.
        const isLegacyModule = typeof (<any>this).stateSavingEnabled !== 'undefined';
        _log.debug('Registering views');
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