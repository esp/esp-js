import {Container, EspDiConsts} from 'esp-js-di';
import {Logger} from '../../core/logger';
import {SystemContainerConst} from './systemContainerConst';
import {StateService} from '../state/stateService';
import {Router} from 'esp-js';
import {RegionManager} from '../regions/regionManager';
import {SchedulerService} from '../../core';
import {ViewRegistryModel} from '../viewFactory';
import {LiteralResolver} from './literalResolver';
import {ModuleLoader} from '../modules/moduleLoader';

const _log = Logger.create('SystemContainerConfiguration');

export class SystemContainerConfiguration {
    public static configureContainer(rootContainer: Container) {
        _log.verbose('Configuring container with system components');

        rootContainer.addResolver(LiteralResolver.resolverName, new LiteralResolver());

        rootContainer
            .register(SystemContainerConst.router, Router)
            .singleton();

        // state service
        rootContainer
            .register(SystemContainerConst.state_service, StateService)
            .singleton();

        rootContainer
            .register(SystemContainerConst.region_manager, RegionManager)
            .inject(SystemContainerConst.router)
            .singleton();
        rootContainer
            .register(SystemContainerConst.scheduler_service, SchedulerService)
            .singleton();

        // module loader
        rootContainer.register(SystemContainerConst.module_loader, ModuleLoader)
            .inject(
                EspDiConsts.owningContainer,
                SystemContainerConst.views_registry_model,
                SystemContainerConst.state_service,
                SystemContainerConst.router
            )
            .singleton();

        // component registry
        rootContainer
            .register(SystemContainerConst.views_registry_model, ViewRegistryModel)
            .inject(SystemContainerConst.router)
            .singleton();
    }
}