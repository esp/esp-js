// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

import * as esp from '../../src';
import {EventEnvelope} from '../../src/router/envelopes';
import {ObservationStage} from '../../src';

describe('Router', () => {

    let _router;
    let _model1, _model2, _model3;
    let _receivedEvents: EventEnvelope<any, any>[];

    beforeEach(() => {
        _router = new esp.Router();
        _model1 = {};
        _model2 = {};
        _model3 = {};
        _receivedEvents = [];
        _router.addModel('modelId1', _model1);
        _router.addModel('modelId2', _model2);
        _router.addModel('modelId3', _model3);
    });

    describe('.getAllEventsObservable()', () => {

        it('it filters on normal observation stage by default', () => {
            _router.getAllEventsObservable().subscribe((envelope: EventEnvelope<any, any>) => {
                _receivedEvents.push(envelope);
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            _router.publishEvent('modelId2', 'Event1', 'theEvent');
            expect(_receivedEvents.length).toBe(2);
            expect(_receivedEvents[0].observationStage).toEqual(esp.ObservationStage.normal);
            expect(_receivedEvents[1].observationStage).toEqual(esp.ObservationStage.normal);

        });

        it('dispatches events to processors', () => {
            _router.getAllEventsObservable(ObservationStage.all).subscribe((envelope: EventEnvelope<any, any>) => {
                _receivedEvents.push(envelope);
            });

            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            _router.publishEvent('modelId2', 'Event1', 'theEvent');
            expect(_receivedEvents.length).toBe(6);

            expect(_receivedEvents[0].modelId).toEqual('modelId1');
            expect(_receivedEvents[0].observationStage).toEqual(esp.ObservationStage.preview);
            expect(_receivedEvents[0].model).toBe(_model1);

            expect(_receivedEvents[1].modelId).toEqual('modelId1');
            expect(_receivedEvents[1].observationStage).toEqual(esp.ObservationStage.normal);
            expect(_receivedEvents[1].model).toBe(_model1);

            expect(_receivedEvents[2].modelId).toEqual('modelId1');
            expect(_receivedEvents[2].observationStage).toEqual(esp.ObservationStage.final);
            expect(_receivedEvents[2].model).toBe(_model1);

            expect(_receivedEvents[3].modelId).toEqual('modelId2');
            expect(_receivedEvents[3].observationStage).toEqual(esp.ObservationStage.preview);
            expect(_receivedEvents[3].model).toBe(_model2);

            expect(_receivedEvents[4].modelId).toEqual('modelId2');
            expect(_receivedEvents[4].observationStage).toEqual(esp.ObservationStage.normal);
            expect(_receivedEvents[4].model).toBe(_model2);

            expect(_receivedEvents[5].modelId).toEqual('modelId2');
            expect(_receivedEvents[5].observationStage).toEqual(esp.ObservationStage.final);
            expect(_receivedEvents[5].model).toBe(_model2);
        });

        it('it filters by events', () => {
            _router.getAllEventsObservable(['Event2', 'Event3']).subscribe((envelope: EventEnvelope<any, any>) => {
                _receivedEvents.push(envelope);
            });

            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            _router.publishEvent('modelId2', 'Event1', 'theEvent');
            expect(_receivedEvents.length).toBe(0);

            _router.publishEvent('modelId1', 'Event2', 'theEvent');
            expect(_receivedEvents.length).toBe(1);
            expect(_receivedEvents[0].eventType).toEqual('Event2');

            _router.publishEvent('modelId2', 'Event3', 'theEvent');
            expect(_receivedEvents.length).toBe(2);
            expect(_receivedEvents[1].eventType).toEqual('Event3');
        });

        it('it filters by events and observation stage', () => {
            _router.getAllEventsObservable(['Event1', 'Event2'], ObservationStage.preview).subscribe((envelope: EventEnvelope<any, any>) => {
                _receivedEvents.push(envelope);
            });

            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            _router.publishEvent('modelId2', 'Event2', 'theEvent');
            _router.publishEvent('modelId3', 'Event3', 'theEvent');
            expect(_receivedEvents.length).toBe(2);

            expect(_receivedEvents[0].modelId).toEqual('modelId1');
            expect(_receivedEvents[0].observationStage).toEqual(esp.ObservationStage.preview);
            expect(_receivedEvents[0].model).toBe(_model1);

            expect(_receivedEvents[1].modelId).toEqual('modelId2');
            expect(_receivedEvents[1].observationStage).toEqual(esp.ObservationStage.preview);
            expect(_receivedEvents[1].model).toBe(_model2);
        });

        it('it filters by observation stage', () => {
            let previewEvents =[], normalEvents = [], committedEvents = [];
            _router.getAllEventsObservable(ObservationStage.preview).subscribe((envelope: EventEnvelope<any, any>) => {
                previewEvents.push(envelope);
            });
            _router.getAllEventsObservable(ObservationStage.normal).subscribe((envelope: EventEnvelope<any, any>) => {
                normalEvents.push(envelope);
                if (envelope.eventType === 'Event3') {
                    envelope.context.commit();
                }
            });
            _router.getAllEventsObservable(ObservationStage.committed).subscribe((envelope: EventEnvelope<any, any>) => {
                committedEvents.push(envelope);
            });

            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            _router.publishEvent('modelId2', 'Event1', 'theEvent');
            expect(previewEvents.length).toBe(2);
            expect(normalEvents.length).toBe(2);
            expect(committedEvents.length).toBe(0);
            _router.publishEvent('modelId2', 'Event3', 'theEvent');
            expect(previewEvents.length).toBe(3);
            expect(normalEvents.length).toBe(3);
            expect(committedEvents.length).toBe(1);
        });
    });
});