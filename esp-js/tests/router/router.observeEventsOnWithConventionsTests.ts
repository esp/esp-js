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

import esp from '../../src';

describe('Router', () => {

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.observeEventsOn with function naming conventions', () => {
        let previewInvokeCount = 0;
        let normalInvokeCount = 0;
        let normal2InvokeCount = 0;
        let committedInvokeCount = 0;
        let subscription;
        let _model = {
            // standard events
            _observe_fooEvent_preview(e, c, m) {
                previewInvokeCount++;
            },
            _observe_fooEvent_normal(e, c, m) {
                normalInvokeCount++;
                c.commit();
            },
            _observe_fooEvent(e, c, m) {
                normal2InvokeCount++;
            },
            _observe_fooEvent_committed(e, c, m) {
                committedInvokeCount++;
            },
            // events with underscores
            _observe_bar_Event_preview(e, c, m) {
                previewInvokeCount++;
            },
            _observe_bar_Event_normal(e, c, m) {
                normalInvokeCount++;
                c.commit();
            },
            _observe_bar_Event(e, c, m) {
                normal2InvokeCount++;
            },
            _observe_bar_Event_committed(e, c, m) {
                committedInvokeCount++;
            },
            // custom prefix
            _customPrefix_bar_Event_preview(e, c, m) {
                previewInvokeCount++;
            },
            _customPrefix_bar_Event_normal(e, c, m) {
                normalInvokeCount++;
                c.commit();
            },
            _customPrefix_bar_Event(e, c, m) {
                normal2InvokeCount++;
            },
            _customPrefix_bar_Event_committed(e, c, m) {
                committedInvokeCount++;
            }
        };

        beforeEach(() => {
            previewInvokeCount = 0;
            normalInvokeCount = 0;
            normal2InvokeCount = 0;
            committedInvokeCount = 0;
            _router.addModel('modelId', _model);
        });

        it('should observe events by event name and stage', ()=> {
            subscription = _router.observeEventsOn('modelId', _model);
            _router.publishEvent('modelId', 'fooEvent', 1);
            expect(previewInvokeCount).toBe(1);
            expect(normalInvokeCount).toBe(1);
            expect(normal2InvokeCount).toBe(1);
            expect(committedInvokeCount).toBe(1);
        });

        it('should observe events with underscores in event name ', ()=> {
            subscription = _router.observeEventsOn('modelId', _model);
            _router.publishEvent('modelId', 'bar_Event', 1);
            expect(previewInvokeCount).toBe(1);
            expect(normalInvokeCount).toBe(1);
            expect(normal2InvokeCount).toBe(1);
            expect(committedInvokeCount).toBe(1);
        });

        it('should observe events with custom prefix in event name ', ()=> {
            subscription = _router.observeEventsOn('modelId', _model, '_customPrefix_');
            _router.publishEvent('modelId', 'bar_Event', 1);
            expect(previewInvokeCount).toBe(1);
            expect(normalInvokeCount).toBe(1);
            expect(normal2InvokeCount).toBe(1);
            expect(committedInvokeCount).toBe(1);
        });

        it('should stop observing events when disposable disposed', ()=> {
            subscription = _router.observeEventsOn('modelId', _model);
            _router.publishEvent('modelId', 'fooEvent', 1);
            _router.publishEvent('modelId', 'fooEvent', 1);
            subscription.dispose();
            _router.publishEvent('modelId', 'fooEvent', 1);
            expect(previewInvokeCount).toBe(2);
            expect(normalInvokeCount).toBe(2);
            expect(normal2InvokeCount).toBe(2);
            expect(committedInvokeCount).toBe(2);
        });

        it('should observe events via prototype chain', ()=> {
            let model2 = Object.create(_model);
            subscription = _router.observeEventsOn('modelId', model2);
            _router.publishEvent('modelId', 'fooEvent', 1);
            expect(previewInvokeCount).toBe(1);
            expect(normalInvokeCount).toBe(1);
            expect(normal2InvokeCount).toBe(1);
            expect(committedInvokeCount).toBe(1);
        });

        it('should observe events via ctor function', ()=> {
            let invokeCount = 0;
            class Model {
                _observe_fooEvent(m, e, c) {
                    invokeCount++;
                }
            }
            let model = new Model();
            subscription = _router.observeEventsOn('modelId', model);
            _router.publishEvent('modelId', 'fooEvent', 1);
            expect(invokeCount).toBe(1);
        });
    });
});