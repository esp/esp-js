import {Container} from 'esp-js-di';
import {DisposableBase, Guard} from 'esp-js';
import {ViewRegistryModel, ViewFactoryBase} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';
import {Module} from './module';
import {ModelBase} from '../modelBase';
import {ModuleMetadata} from './moduleDecorator';
import {DefaultStateProvider} from '../viewFactory/defaultStateProvider';
import {EspModuleDecoratorUtils} from './moduleDecorator';
import {Logger} from '../../core';

const _log: Logger = Logger.create('ModuleBase');

export abstract class ModuleBase extends DisposableBase implements Module {
    private readonly _moduleMetadata: ModuleMetadata;

    protected constructor(protected readonly container: Container) {
        super();
        Guard.isDefined(container, 'container must be defined');
        // seems to make sense for the module to own it's container,
        // disposing the module will dispose it's container and thus all it's child components.
        this.addDisposable(container);
        this._moduleMetadata = EspModuleDecoratorUtils.getMetadataFromModuleInstance(this);
    }

    abstract configureContainer();

    abstract registerPrerequisites(register: PrerequisiteRegister): void;

    initialise(): void { }

    registerViewFactories(viewRegistryModel: ViewRegistryModel) {
        _log.debug('Registering views');
        let viewFactories: Array<ViewFactoryBase<any>> = this.getViewFactories();
        viewFactories.forEach(viewFactory => {
            viewRegistryModel.registerViewFactory(this._moduleMetadata.moduleKey, this._moduleMetadata.moduleName, viewFactory);
            this.addDisposable(() => {
                viewRegistryModel.unregisterViewFactory(viewFactory);
            });
        });
    }

    // override if required
    getViewFactories(): Array<ViewFactoryBase<ModelBase>> {
        return [];
    }

    // loadViews(viewRegistryModel: ViewRegistryModel, viewStates: ViewFactoryState[]) {
    //     if (this._hasLoaded) {
    //         this.unloadViews();
    //     }
    //    // let viewFactoriesState = this._stateService.getModuleState<ViewFactoryState[]>(this._moduleMetadata.moduleKey, this._currentLayout);
    //     if (viewStates === null && this.getDefaultStateProvider()) {
    //         Guard.isDefined(this.getDefaultStateProvider(), `_defaultStateProvider was not provided for module ${this._moduleMetadata.moduleKey}`);
    //         viewStates = this.getDefaultStateProvider().getViewFactoriesState();
    //     }
    //
    //     if (viewStates) {
    //         viewStates.forEach((viewFactoryState: ViewFactoryState) => {
    //             if (viewRegistryModel.hasViewFactory(viewFactoryState.viewFactoryKey)) {
    //                 let viewFactory: ViewFactoryBase<ModelBase> = viewRegistryModel.getViewFactory(viewFactoryState.viewFactoryKey);
    //                 viewFactoryState.state.forEach((state: any) => {
    //                     viewFactory.createView(state);
    //                 });
    //             } else {
    //                 // It's possible the component factory isn't loaded, perhaps old state had a component which the users currently isn't entitled to see ATM.
    //                 _log.warn(`Skipping load for component as it's factory of type [${viewFactoryState.viewFactoryKey}] is not registered`);
    //             }
    //         });
    //     }
    // }
    //
    // unloadViews() {
    //     if (!this._hasLoaded) {
    //         return;
    //     }
    //     this.getViewFactories().forEach((factory: ViewFactoryBase<ModelBase>) => {
    //         factory.shutdownAllViews();
    //     });
    //     this._hasLoaded = false;
    // }
}