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

describe('Router', () => {

    let _router: esp.Router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.getModelObservable()', () => {

        beforeEach(() => {
            _router.addModel('modelId1', {number:0});
            _router.addModel('modelId2', {number:0});
        });

        it('throws if arguments incorrect', () => {
            expect(() => {_router.getModelObservable(undefined).subscribe(() => {}); }).toThrow(new Error('The modelId should be a string'));
            expect(() => {_router.getModelObservable({}).subscribe(() => {}); }).toThrow(new Error('The modelId should be a string'));
        });

        it('dispatches model once registered', () => {
            let model3UpdateCount = 0;
            _router.addModel('modelId3', {number:0});
            _router.getModelObservable('modelId1').subscribe(() => {
                model3UpdateCount++;
            });
            expect(model3UpdateCount).toBe(1);
        });

        it('dispatches model updates to observers by modelid', () => {
            let model1UpdateCount = 0, model2UpdateCount = 0;
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => { /*noop*/  });
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            _router.getEventObservable('modelId2', 'Event1').subscribe(() => { /*noop*/  });
            _router.getModelObservable('modelId2').subscribe(() => {
                model2UpdateCount++;
            });
            _router.publishEvent('modelId1', 'Event1', 'payload');
            _router.publishEvent('modelId2', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(2);
            expect(model2UpdateCount).toBe(2);
        });

        it('doesn\'t dispatch to disposed update observers', () => {
            let model1UpdateCount = 0;
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => { /*noop*/  });
            let disposable = _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(2);
            disposable.dispose();
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(2);
        });

        it('dispatches model updates after that models event queue is empty, but before processing next model', () => {
            let model1UpdateCount = 0,
                model2UpdateCount = 0,
                model1EventCount = 0,
                model2EventCount = 0,
                check1 = false,
                check2 = false;
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            _router.getModelObservable('modelId2').subscribe(() => {
                model2UpdateCount++;
            });
            expect(model1UpdateCount).toBe(1);
            expect(model2UpdateCount).toBe(1);
            _router.getEventObservable('modelId1', 'StartEvent').subscribe(() => {
                _router.publishEvent('modelId1', 'Event1', 1);
                _router.publishEvent('modelId2', 'Event1', 2);
                _router.publishEvent('modelId1', 'Event1', 3);
                _router.publishEvent('modelId2', 'Event1', 4);
            });
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => {
                model1EventCount++;
                // each model should have only had an initial update dispatched by this time
                check1 = model1UpdateCount === 1 && model2UpdateCount ===1;
            });
            _router.getEventObservable('modelId2', 'Event1').subscribe(() => {
                // by the time we process this event for model 2, model 1
                // should have processed both it's events AND have dispatched it's model
                model2EventCount++;
                check2 = model1UpdateCount === 2 && model2UpdateCount === 1 && model1EventCount === 2;
            });
            _router.publishEvent('modelId1', 'StartEvent', 'payload');
            expect(model1UpdateCount).toEqual(2);
            expect(model1EventCount).toEqual(2);
            expect(model2UpdateCount).toEqual(2);
            expect(model2EventCount).toEqual(2);
            expect(check1).toEqual(true);
            expect(check2).toEqual(true);
        });

        it('processes events published during model dispatch', () => {
            let event2Received = false;
            let publishedEvent2 = false;
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => { /* noop */ });
            _router.getEventObservable('modelId1', 'Event2').subscribe(() => {
                event2Received = true;
            });
            _router.getModelObservable('modelId1').subscribe(() => {
                if(!publishedEvent2) {
                    publishedEvent2 = true;
                    _router.publishEvent('modelId1', 'Event2', 1);
                }
            });
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(event2Received).toBe(true);
        });

        it('only dispatches changes for models which processed an event', () => {
            let model1UpdateCount = 0, model2UpdateCount = 0;
            _router.getEventObservable('modelId2', 'StartEvent').subscribe(() => {
                _router.publishEvent('modelId2', 'Event1', 'payload');
            });
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => { /*noop*/  });
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            expect(model1UpdateCount).toBe(1);
            _router.getEventObservable('modelId2', 'Event1').subscribe(() => { /*noop*/  });
            _router.getModelObservable('modelId2').subscribe(() => {
                model2UpdateCount++;
            });
            expect(model2UpdateCount).toBe(1);
            _router.publishEvent('modelId2', 'StartEvent', 'payload');
            expect(model1UpdateCount).toBe(1);
            expect(model2UpdateCount).toBe(2);
        });

        it('should dispatch change to models if event if only one event was processed', () => {
            // there is a condition whereby the first processors processes the event flagging the model as dirty,
            // but the second event doesn't get processed which un flags the prior event
            pending();
        });

        it('should pump the last model on observation', () => {
            let model1UpdateCount = 0, model1UpdateCount2 = 0;
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => { /*noop*/  });
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            expect(model1UpdateCount).toBe(1);
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(2);
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount2++;
            });
            expect(model1UpdateCount).toBe(2);
            expect(model1UpdateCount2).toBe(1);
        });

        it('should pump the last model on first observation after first event', () => {
            // this is a different edge case to the 'should pump the last model on observation'
            // it appears that there was a bug whereby if there are no model observers and an event loop completes,
            // the router/subject doesn't set the streams model as there are no observers.
            let model1UpdateCount = 0, model1UpdateCount2 = 0;
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => { /*noop*/  });
            expect(model1UpdateCount).toBe(0);
            _router.publishEvent('modelId1', 'Event1', 'payload');
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            expect(model1UpdateCount).toBe(1);
        });

        it('should use options.modelObservableMapper if provided when dispatching the model', () => {
            _router.addModel(
                'modelId3',
                {number:0, subPart: { foo: 'theFoo' }},
                { modelObservableMapper: (model) => model.subPart }
            );
            _router.getEventObservable('modelId3', 'Event1').subscribe(() => { /*noop*/  });
            let _receivedModels = [];
            _router.getModelObservable('modelId3').subscribe((m) => {
                _receivedModels.push(m);
            });
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(_receivedModels.length).toEqual(1);
            expect(_receivedModels[0]).toEqual({ foo: 'theFoo'});
        });
    });
});