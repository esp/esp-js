import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RouterProvider, SmartComponent} from 'esp-js-react';
import { Container } from 'microdi-js';
import {
    Logger,
    ModuleBase,
    StateService,
    ComponentFactoryBase,
    MultiItemRegionModel,
    SingleItemRegionModel,
    LiteralResolver,
    SystemContainerConfiguration,
    SystemContainerConst,
    ModuleLoader,
    ModuleDescriptor,
    ModuleLoadChange
} from 'esp-js-ui';
import ShellModel from './models/shellModel';
import ShellModuleContainerConst from './shellModuleContainerConst';
import RegionNames from './regionNames';
import {Router} from 'esp-js';
import TradingModule from '../trading-module/tradingModule';

let _log = Logger.create('ShellBootstrapper');

class ShellBootstrapper {
    private _container:Container;
    private _moduleLoader:ModuleLoader;

    start() {
        this._container = new Container();
        SystemContainerConfiguration.configureContainer(this._container);
        this._configureContainer();
        this._displayShell();
    }

    _configureContainer() {
        this._container
            .register(ShellModuleContainerConst.workspace_region, MultiItemRegionModel)
            .inject(
                {resolver:LiteralResolver.resolverName, value: RegionNames.workspaceRegion},
                SystemContainerConst.router,
                SystemContainerConst.region_manager
            )
            .singleton();
        this._container
            .register(ShellModuleContainerConst.blotter_region, SingleItemRegionModel)
            .inject(
                {resolver:LiteralResolver.resolverName, value: RegionNames.blotterRegion},
                SystemContainerConst.router,
                SystemContainerConst.region_manager
            )
            .singleton();
        this._container
            .register(ShellModuleContainerConst.shell_model, ShellModel)
            .inject(
                SystemContainerConst.router,
                SystemContainerConst.module_loader,
                ShellModuleContainerConst.workspace_region,
                ShellModuleContainerConst.blotter_region
            );
    }

    _displayShell() {
        let shellModel = this._container.resolve<ShellModel>(ShellModuleContainerConst.shell_model);
        let router = this._container.resolve<Router>(SystemContainerConst.router);
        shellModel.observeEvents();
        _log.verbose('Displaying UI');
        ReactDOM.render(
            <RouterProvider router={router}>
                <div>
                    <SmartComponent modelId={shellModel.modelId} />
                </div>
            </RouterProvider>,
            document.getElementById('root')
        );
        shellModel.init();
    }
}

new ShellBootstrapper().start();
