import * as React from 'react';
import {ConnectableComponent, RouterProvider} from 'esp-js-react';
import {Container} from 'esp-js-di';
import {Level, LiteralResolver, Logger, LoggingConfig, StatefulRegion, SystemContainerConfiguration, SystemContainerConst} from 'esp-js-ui';
import {ShellModel} from './models/shellModel';
import {ShellModuleContainerConst} from './shellModuleContainerConst';
import {RegionNames} from './regionNames';
import {Router} from 'esp-js';

LoggingConfig.defaultLoggerConfig.level = Level.verbose;

const _log = Logger.create('ShellBootstrapper');

export class ShellBootstrapper {
    private readonly _container: Container;
    private readonly _rootElement: any;

    constructor() {
        this._container = new Container();
        SystemContainerConfiguration.configureContainer(this._container);
        this._configureContainer();
        this._container.resolve<Router>(SystemContainerConst.router).enableDiagnosticLogging = true;
        this._rootElement = this._createRootElement();
    }

    get rootElement() {
        return this._rootElement;
    }

    _configureContainer() {
        this._container
            .register(ShellModuleContainerConst.workspace_region, StatefulRegion)
            .inject(
                {resolver: LiteralResolver.resolverName, value: RegionNames.workspaceRegion},
                SystemContainerConst.router,
                SystemContainerConst.region_manager,
                SystemContainerConst.views_registry_model,
            )
            .singleton();
        this._container
            .register(ShellModuleContainerConst.blotter_region, StatefulRegion)
            .inject(
                {resolver: LiteralResolver.resolverName, value: RegionNames.blotterRegion},
                SystemContainerConst.router,
                SystemContainerConst.region_manager,
                SystemContainerConst.views_registry_model,
            )
            .singleton();
        this._container
            .register(ShellModuleContainerConst.shell_model, ShellModel)
            .inject(
                SystemContainerConst.router,
                SystemContainerConst.module_loader,
                ShellModuleContainerConst.workspace_region,
                ShellModuleContainerConst.blotter_region,
                SystemContainerConst.state_service,
            );
    }

    _createRootElement(): any {
        let shellModel = this._container.resolve<ShellModel>(ShellModuleContainerConst.shell_model);
        let router = this._container.resolve<Router>(SystemContainerConst.router);
        shellModel.observeEvents();
        shellModel.init();
        _log.verbose('Displaying UI');
        return (
            <RouterProvider router={router}>
                <div>
                    <ConnectableComponent modelId={shellModel.modelId}/>
                </div>
            </RouterProvider>
        );
    }
}