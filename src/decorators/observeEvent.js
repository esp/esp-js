import { ObservationStage, Const } from '../router';

function trySetMetadata(target) {
    if(!target._espDecoratorMetadata) {
        target._espDecoratorMetadata = {
            events:[]
        };
    }
}

export let DecoratorTypes = {
    observeEvent:'observeEvent',
    observeModelChangedEvent:'observeModelChangedEvent'
};

export function observeEvent(eventName, observationStage) {
    return function (target, name, descriptor) {
        if(eventName === Const.modelChangedEvent) {
            throw new Error(`Can not use observeEvent to observe the ${Const.modelChangedEvent} on function target ${name}. Use the observeModelChangedEvent decorator instead`);
        }
        trySetMetadata(target);
        target._espDecoratorMetadata.events.push({
            functionName:name,
            eventName: eventName,
            observationStage: observationStage || ObservationStage.normal,
            decoratorType:DecoratorTypes.observeEvent
        });
        return descriptor;
    };
};

export function observeModelChangedEvent(modelId) {
    return function (target, name, descriptor) {
        trySetMetadata(target);
        target._espDecoratorMetadata.events.push({
            functionName:name,
            eventName: Const.modelChangedEvent,
            observationStage: ObservationStage.normal,
            modelId:modelId,
            decoratorType:DecoratorTypes.observeModelChangedEvent
        });
        return descriptor;
    };
};