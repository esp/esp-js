import {Container, MicroDiConsts} from 'microdi-js';
import Logger from '../../core/logger';
import SystemContainerConst from './systemContainerConst';
import StateService from '../state/stateService';
import {Router} from 'esp-js';
import RegionManager from '../regions/regionManager';
import {SchedulerService} from '../../core/schedulerService';
import ComponentRegistryModel from '../components/componentRegistryModel';
import LiteralResolver from './literalResolver';
import ModuleLoader from '../modules/moduleLoader';

let _log = Logger.create('SystemContainerConfiguration');

export default class SystemContainerConfiguration {
    public static configureContainer(rootContainer:Container) {
        _log.verbose('Configuring container with system components');

        rootContainer.addResolver(LiteralResolver.resolverName, new LiteralResolver());

        rootContainer.registerInstance(SystemContainerConst.router, new Router());

        // state service
        rootContainer.register(SystemContainerConst.state_service, StateService);

        rootContainer.register(SystemContainerConst.region_manager, RegionManager);
        rootContainer.register(SystemContainerConst.scheduler_service, SchedulerService);

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
            .inject(SystemContainerConst.router);
    }
}