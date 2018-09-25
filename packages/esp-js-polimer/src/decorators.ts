import {EspDecoratorUtil, Guard, EspMetadata, ObservationStage} from 'esp-js';

export function stateHandlerFor(eventType: string) {
    return function (target, name, descriptor) {
        Guard.stringIsNotEmpty(eventType, 'eventType passed to an observeStoreEvent decorator must not be \'\'');
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addEvent(
            name,
            eventType,
            false,
            null,
            null
        );
        return descriptor;
    };
}

export function eventTransformFor(eventType: string, observationStage = ObservationStage.committed) {
    return function (target, name, descriptor) {
        Guard.stringIsNotEmpty(eventType, 'eventType passed to an observeStoreEvent decorator must not be \'\'');
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addEvent(
            name,
            eventType,
            false,
            observationStage,
            null
        );
        return descriptor;
    };
}