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

import esp, {ObservationStage} from '../../src';
import {EventEnvelope} from '../../src/router/envelopes';

describe('Router', () => {

    let _router;
    let _model1, _model2;
    let _receivedEvents: EventEnvelope<any, any>[];

    beforeEach(() => {
        _router = new esp.Router();
        _model1 = {};
        _model2 = {};
        _receivedEvents = [];
        _router.addModel('modelId1', _model1);
        _router.addModel('modelId2', _model2);
        _router.getAllEventsObservable().subscribe((envelope: EventEnvelope<any, any>) => {
            _receivedEvents.push(envelope);
        });
    });

    describe('.getAllEventsObservable()', () => {

        it('dispatches events to processors by modelid', () => {
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            _router.publishEvent('modelId2', 'Event1', 'theEvent');
            expect(_receivedEvents.length).toBe(4);

            expect(_receivedEvents[0].modelId).toEqual('modelId1');
            expect(_receivedEvents[0].observationStage).toEqual(ObservationStage.preview);
            expect(_receivedEvents[0].model).toBe(_model1);

            expect(_receivedEvents[1].modelId).toEqual('modelId1');
            expect(_receivedEvents[1].observationStage).toEqual(ObservationStage.normal);
            expect(_receivedEvents[1].model).toBe(_model1);

            expect(_receivedEvents[2].modelId).toEqual('modelId2');
            expect(_receivedEvents[2].observationStage).toEqual(ObservationStage.preview);
            expect(_receivedEvents[2].model).toBe(_model2);

            expect(_receivedEvents[3].modelId).toEqual('modelId2');
            expect(_receivedEvents[3].observationStage).toEqual(ObservationStage.normal);
            expect(_receivedEvents[3].model).toBe(_model2);
        });
    });
});