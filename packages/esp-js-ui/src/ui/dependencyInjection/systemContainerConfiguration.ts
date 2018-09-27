import {Container, MicroDiConsts} from 'microdi-js';
import {Logger} from '../../core/logger';
import {SystemContainerConst} from './systemContainerConst';
import {StateService} from '../state/stateService';
import {Router} from 'esp-js';
import {RegionManager} from '../regions/regionManager';
import {SchedulerService} from '../../core';
import {ComponentRegistryModel} from '../components';
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
                MicroDiConsts.owningContainer,
                SystemContainerConst.components_registry_model,
                SystemContainerConst.state_service
            )
            .singleton();

        // component registry
        rootContainer
            .register(SystemContainerConst.components_registry_model, ComponentRegistryModel)
            .inject(SystemContainerConst.router)
            .singleton();
    }
}