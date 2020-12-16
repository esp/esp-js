import * as React from 'react';
import {ConnectableComponent, RouterProvider} from 'esp-js-react';
import {AppDefaultStateProvider, Level, LiteralResolver, Logger, LoggingConfig, StatefulRegion, SystemContainerConst} from 'esp-js-ui';
import {ShellModel} from './models/shellModel';
import {ShellModuleContainerConst} from './shellModuleContainerConst';
import {RegionNames} from './regionNames';
import {Router} from 'esp-js';
import {Shell} from 'esp-js-ui';
import {DefaultStateProvider} from '../defaultStateProvider';

LoggingConfig.defaultLoggerConfig.level = Level.verbose;

const _log = Logger.create('AppShell');

export class AppShell extends Shell {
    private _rootElement: any;

    get rootElement() {
        return this._rootElement;
    }

    get stateSavingEnabled(): boolean {
        return true;
    }

    get stateSaveIntervalMs(): number {
        return 10_000;
    }

    getDefaultStateProvider(): AppDefaultStateProvider {
        return DefaultStateProvider;
    }

    get appStateKey() {
        return 'esp-demo-app-state';
    }

    configureContainer() {
        this.container
            .register(ShellModuleContainerConst.workspace_region, StatefulRegion)
            .inject(
                {resolver: LiteralResolver.resolverName, value: RegionNames.workspaceRegion},
                SystemContainerConst.router,
                SystemContainerConst.region_manager,
                SystemContainerConst.views_registry_model,
            )
            .singleton();
        this.container
            .register(ShellModuleContainerConst.blotter_region, StatefulRegion)
            .inject(
                {resolver: LiteralResolver.resolverName, value: RegionNames.blotterRegion},
                SystemContainerConst.router,
                SystemContainerConst.region_manager,
                SystemContainerConst.views_registry_model,
            )
            .singleton();
        this.container
            .register(ShellModuleContainerConst.shell_model, ShellModel)
            .inject(
                SystemContainerConst.router,
                ShellModuleContainerConst.workspace_region,
                ShellModuleContainerConst.blotter_region,
                SystemContainerConst.state_service,
            );
    }

    start() {
        super.start();
        this.container.resolve<Router>(SystemContainerConst.router).enableDiagnosticLogging = true;
        this._rootElement = this._createRootElement();
    }

    _createRootElement(): any {
        // note we inject the Shell itself into the ShellModel so it can carry out
        // loading based on business logic
        let shellModel = this.container.resolve<ShellModel>(ShellModuleContainerConst.shell_model, this);
        let router = this.container.resolve<Router>(SystemContainerConst.router);
        shellModel.observeEvents();
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