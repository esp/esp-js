import {SingleModuleLoaderBase} from './singleModuleLoaderBase';
import {Container} from 'esp-js-di';
import {ViewRegistryModel} from '../viewFactory';
import {StateService} from '../state';
import {ModuleMetadata} from './moduleDecorator';
import {ShellModule, ShellModuleConstructor} from './shellModule';

export class ShellModuleLoader extends SingleModuleLoaderBase<ShellModule> {
    constructor(
        _container: Container,
        _viewRegistryModel: ViewRegistryModel,
        private _stateService: StateService,
        private _moduleConstructor: ShellModuleConstructor,
        _moduleMetadata: ModuleMetadata
    ) {
        super(_container, _viewRegistryModel, _moduleMetadata);
    }

    protected _createModule(): ShellModule {
        let module = new this._moduleConstructor(
            this._container.createChildContainer(),
            this._stateService
        );
        return <ShellModule>module;
    }
}