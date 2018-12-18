import {EspDecoratorUtil, Guard, EspMetadata, ObservationStage, DecoratorTypes, ObserveEventPredicate} from 'esp-js';

// export interface StateHandlerEventPredicate {
//     (state: any, event: any, store: any): boolean;

// this will change to (store, event, state), so we can line it up with the existing ObserveEventPredicate

// }

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