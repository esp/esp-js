import {Container, EspDiConsts} from 'esp-js-di';
import {SystemContainerConst} from './systemContainerConst';
import {LocalStorageStateService} from '../state/stateService';
import {Router, Logger} from 'esp-js';
import {ViewRegistryModel} from '../viewFactory';
import {LiteralResolver} from './literalResolver';
import {SchedulerService} from '../../core';
import {RegionManager} from '../regions/models';
import {AggregateHealthIndicator} from '../../health';

const _log = Logger.create('SystemContainerConfiguration');

export class SystemContainerConfiguration {
    public static configureContainer(rootContainer: Container) {
        _log.verbose('Configuring container with system components');

        if (!rootContainer.isRegistered(SystemContainerConst.aggregate_health_indicator)) {
            // Register the health indicator as an instance as it needs to be up and running before types start resolving.
            rootContainer.registerInstance(SystemContainerConst.aggregate_health_indicator, new AggregateHealthIndicator(rootContainer));
        }

        rootContainer.addResolver(LiteralResolver.resolverName, new LiteralResolver());

        rootContainer
            .register(SystemContainerConst.router, Router)
            .singleton();

        rootContainer
            .register(SystemContainerConst.state_service, LocalStorageStateService)
            .singleton();

        rootContainer
            .register(SystemContainerConst.region_manager, RegionManager)
            .inject(SystemContainerConst.router)
            .singleton();
        rootContainer
            .register(SystemContainerConst.scheduler_service, SchedulerService)
            .singleton();

        rootContainer
            .register(SystemContainerConst.views_registry_model, ViewRegistryModel)
            .inject(SystemContainerConst.router)
            .singleton();
    }
}