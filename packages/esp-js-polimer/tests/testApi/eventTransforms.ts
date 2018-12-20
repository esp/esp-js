import * as Rx from 'rx';
import {EventConst, TestEvent, TestStore} from './testStore';
import {eventTransformFor, InputEvent, InputEventStream, OutputEvent, OutputEventStream} from '../../src';

export class ObjectEventTransforms {
    @eventTransformFor(EventConst.event7)
    _onEvent7(inputEventStream: InputEventStream<TestStore, TestEvent>): OutputEventStream<TestEvent> {
        return inputEventStream
            .map((inputEvent: InputEvent<TestStore, TestEvent>) => {
                let event = <OutputEvent<TestEvent>>{
                    eventType: EventConst.event8,
                    event: { transformedEventKey: 'transformedEvent_event7', eventKey: inputEvent.event.eventKey }
                };
                return Rx.Observable.return(event);
            })
            .switch();
    }
    @eventTransformFor(EventConst.eventNotObservedByModel)
    _onEventNotObservedByModel(inputEventStream: InputEventStream<TestStore, TestEvent>): OutputEventStream<TestEvent> {
        return inputEventStream
            .map((inputEvent: InputEvent<TestStore, TestEvent>) => {
                let event = <OutputEvent<TestEvent>>{
                    eventType: EventConst.event8,
                    event: { transformedEventKey: 'transformedEvent_eventNotObservedByModel', eventKey: inputEvent.event.eventKey }
                };
                return Rx.Observable.return(event);
            })
            .switch();
    }
}