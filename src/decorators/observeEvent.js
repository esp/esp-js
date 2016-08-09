import {ObservationStage, Const} from '../router';
import EspDecoratorMetadata from './espDecoratorMetadata';

export let DecoratorTypes = {
    observeEvent: 'observeEvent',
    observeModelChangedEvent: 'observeModelChangedEvent'
};

export function observeEvent(eventName, observationStage) {
    return function (target, name, descriptor) {
        if (eventName === Const.modelChangedEvent) {
            throw new Error(`Can not use observeEvent to observe the ${Const.modelChangedEvent} on function target ${name}. Use the observeModelChangedEvent decorator instead`);
        }
        let metadata = EspDecoratorMetadata.getOrCreateOwnMetaData(target);
        metadata.addEvent(
            name,
            eventName,
            DecoratorTypes.observeEvent,
            observationStage
        );
        return descriptor;
    };
};

export function observeModelChangedEvent(modelId) {
    return function (target, name, descriptor) {
        let metadata = EspDecoratorMetadata.getOrCreateOwnMetaData(target);
        metadata.addEvent(
            name,
            Const.modelChangedEvent,
            DecoratorTypes.observeModelChangedEvent,
            ObservationStage.normal,
            modelId
        );
        return descriptor;
    };
};