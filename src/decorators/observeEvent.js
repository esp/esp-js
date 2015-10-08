import ObservationStage from '../router/ObservationStage';

var observeEvent = function(eventName, observationStage) {
    return function (target, name, descriptor) {
        if(!target._espDecoratorMetadata) {
            target._espDecoratorMetadata = {
                events:[]
            };
        }
        target._espDecoratorMetadata.events.push({
            functionName:name,
            eventName: eventName,
            observationStage: observationStage || ObservationStage.normal
        });
        return descriptor;
    };
};
export default observeEvent;