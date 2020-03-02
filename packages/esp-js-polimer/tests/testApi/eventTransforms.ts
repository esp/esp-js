import * as Rx from 'rxjs';
import {EventConst, TestEvent, TestImmutableModel} from './testModel';
import {eventTransformFor, InputEvent, InputEventStream, OutputEvent, OutputEventStream} from '../../src';

export class ObjectEventTransforms {

    @eventTransformFor(EventConst.event7)
    _onEvent7(inputEventStream: InputEventStream<TestImmutableModel, TestEvent>): OutputEventStream<TestEvent> {
        return inputEventStream
            .map((inputEvent: InputEvent<TestImmutableModel, TestEvent>) => {
                let event = <OutputEvent<TestEvent>>{
                    eventType: EventConst.event8,
                    event: { transformedEventKey: 'transformedEvent_event7', eventKey: inputEvent.event.eventKey }
                };
                return Rx.Observable.of(event);
            })
            .switch();
    }

    @eventTransformFor(EventConst.eventNotObservedByModel)
    _onEventNotObservedByModel(inputEventStream: InputEventStream<TestImmutableModel, TestEvent>): OutputEventStream<TestEvent> {
        return inputEventStream
            .map((inputEvent: InputEvent<TestImmutableModel, TestEvent>) => {
                let event = <OutputEvent<TestEvent>>{
                    eventType: EventConst.event8,
                    modelId: inputEvent.event.publishToModelId,
                    event: { transformedEventKey: 'transformedEvent_eventNotObservedByModel', eventKey: inputEvent.event.eventKey }
                };
                return Rx.Observable.of(event);
            })
            .switch();
    }
}