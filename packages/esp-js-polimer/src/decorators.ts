import {EspDecoratorUtil, Guard, EspMetadata, ObservationStage, DecoratorTypes} from 'esp-js';

export interface StateHandlerEventPredicate {
    (state: any, event: any, store: any): boolean;
}

// export function stateHandlerFor(eventType: string, predicate?: StateHandlerEventPredicate) {
//     return function (target, name, descriptor) {
//         Guard.stringIsNotEmpty(eventType, 'eventType passed to an observeStoreEvent decorator must not be \'\'');
//         let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
//         metadata.addEvent(
//             name,
//             eventType,
//             DecoratorTypes.custom,
//             null,
//             predicate
//         );
//         return descriptor;
//     };
// }

export function eventTransformFor(eventType: string, observationStage = ObservationStage.committed) {
    return function (target, name, descriptor) {
        Guard.stringIsNotEmpty(eventType, 'eventType passed to an observeStoreEvent decorator must not be \'\'');
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addEvent(
            name,
            eventType,
            DecoratorTypes.custom,
            observationStage,
            null
        );
        return descriptor;
    };
}