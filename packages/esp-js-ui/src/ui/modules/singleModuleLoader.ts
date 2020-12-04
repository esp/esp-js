import {Container} from 'esp-js-di';
import {ViewRegistryModel} from '../viewFactory';
import {ModuleConstructor} from './module';
import {ModuleMetadata} from './moduleDecorator';
import {SingleModuleLoaderBase} from './singleModuleLoaderBase';
import {ModuleBase} from './moduleBase';

export class SingleModuleLoader<TModule extends ModuleBase> extends SingleModuleLoaderBase<TModule> {
    constructor(
        _container: Container,
        _viewRegistryModel: ViewRegistryModel,
        private _moduleConstructor: ModuleConstructor,
        _moduleMetadata: ModuleMetadata
    ) {
        super(_container, _viewRegistryModel, _moduleMetadata);
    }

    protected _createModule(): TModule {
        let module = new this._moduleConstructor(
            this._container.createChildContainer()
        );
        return <TModule>module;
    }
}