import {EventConst, TestEvent, TestImmutableModel} from './testModel';
import {eventTransformFor, InputEvent, InputEventStream, OutputEvent, OutputEventStream} from '../../src';
import {map, switchAll} from 'rxjs/operators';
import {of} from 'rxjs';

export class ObjectEventTransforms {
    @eventTransformFor(EventConst.event7)
    _onEvent7(inputEventStream: InputEventStream<TestImmutableModel, TestEvent>): OutputEventStream<TestEvent> {
        return inputEventStream
            .pipe(
                map((inputEvent: InputEvent<TestImmutableModel, TestEvent>) => {
                    let innerEvent = { transformedEventKey: 'transformedEvent_event7', eventKey: inputEvent.event.eventKey };
                    let outputEvent: OutputEvent<TestEvent> = {
                        eventType: EventConst.event8,
                            event: innerEvent
                    };
                    return of(outputEvent);
                }),
                switchAll()
            );
    }

    @eventTransformFor(EventConst.eventNotObservedByModel)
    _onEventNotObservedByModel(inputEventStream: InputEventStream<TestImmutableModel, TestEvent>): OutputEventStream<TestEvent> {
        return inputEventStream
            .pipe(
                map((inputEvent: InputEvent<TestImmutableModel, TestEvent>) => {
                    let event = <OutputEvent<TestEvent>>{
                        eventType: EventConst.event8,
                        address: { modelId: inputEvent.event.publishToModelId },
                        event: { transformedEventKey: 'transformedEvent_eventNotObservedByModel', eventKey: inputEvent.event.eventKey }
                    };
                    return of(event);
                }),
                switchAll()
            );
    }
}

export class ObjectEventTransformsSpy {
    constructor() {
    }
    public receivedEvents: InputEvent<TestImmutableModel, TestEvent>[] = [];
    @eventTransformFor(EventConst.event1)
    _onEventNotObservedByModel(inputEventStream: InputEventStream<TestImmutableModel, TestEvent>): OutputEventStream<TestEvent> {
        return inputEventStream
            .pipe(
                map((inputEvent: InputEvent<TestImmutableModel, TestEvent>) => {
                    this.receivedEvents.push(inputEvent);
                    let event = <OutputEvent<TestEvent>>{
                        eventType: inputEvent.event.outputEventType,
                        event: inputEvent.event.outputEvent
                    };
                    return of(event);
                }),
                switchAll()
            );
    }
}