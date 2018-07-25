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

    describe('.createObservableFor()', () => {

        describe('model event workflow', () => {

            let _router, _model1, _model2, _workflowActions;

            class TestModel {
                constructor(id, router, workflowActions) {
                    this.modelId = id;
                    this.workflowActions = workflowActions || [];
                    this._router = router;
                    this.priceSubject = router.createSubject();
                }

                registerWitRouter() {
                    this._router.addModel(this.modelId, this);
                }

                preProcess() {
                    this.workflowActions.push(`preProcess-${this.modelId}`);
                }

                getPrices() {
                    return this._router.createObservableFor(
                        this.modelId,
                        observer => {
                            this.workflowActions.push(`obsCreate-${this.modelId}`);
                            let subscription = this.priceSubject.subscribe(observer);
                            return () => {
                                this.workflowActions.push(`disposed-${this.modelId}`);
                                subscription.dispose();
                            };
                        }
                    );
                }

                postProcess() {
                    this.workflowActions.push(`postProcess-${this.modelId}`);
                }
            }

            beforeEach(() => {
                _router = new esp.Router();
                _workflowActions = [];
                _model1 = new TestModel('m1', _router, _workflowActions);
                _model1.registerWitRouter();
                _model2 = new TestModel('m2', _router, _workflowActions);
                _model2.registerWitRouter();
            });

            it('subscribes on correct dispatch loop', () => {
                _model1
                    .getPrices()
                    .streamFor(_model2.modelId)
                    .subscribe(o => {
                    });
                expect(_workflowActions).toEqual(['preProcess-m1', 'obsCreate-m1', 'postProcess-m1']);
            });

            it('notifies on correct dispatch loop', () => {
                _model1
                    .getPrices()
                    .streamFor(_model2.modelId)
                    .subscribe(
                        i => {
                            if (_router.isOnDispatchLoopFor(_model2.modelId)) {
                                _workflowActions.push(`observerCalled-${i}`);
                            }
                        }
                    );
                _workflowActions.length = 0; // clear initial subscribe workflows
                _model1.priceSubject.onNext('aPrice');
                expect(_workflowActions).toEqual(['preProcess-m2', 'observerCalled-aPrice', 'postProcess-m2']);
            });

            it('completes on correct dispatch loop', () => {
                _model1
                    .getPrices()
                    .streamFor(_model2.modelId)
                    .subscribe(
                        o => {
                            _workflowActions.push('observerCalled'); // shouldn't be hit
                        },
                        () => {
                            if (_router.isOnDispatchLoopFor(_model2.modelId)) {
                                _workflowActions.push('completed');
                            }
                        }
                    );
                _workflowActions.length = 0; // clear initial subscribe workflows
                _model1.priceSubject.onCompleted();
                expect(_workflowActions).toEqual(['preProcess-m2', 'completed', 'postProcess-m2']);
            });

            it('disposes on correct dispatch loop', () => {
                let subscription = _model1
                    .getPrices()
                    .streamFor(_model2.modelId)
                    .subscribe(o => {
                    });
                _workflowActions.length = 0; // clear initial subscribe workflows
                subscription.dispose();
                expect(_workflowActions).toEqual(['preProcess-m1', 'disposed-m1', 'postProcess-m1']);
            });

            describe('single model router', () => {
                it('honours same workflow as full router', () => {
                    // we could break down the tests for the single model router as we've done for the full router above
                    // however it's really only proxying the underlying router so a smoke test is sufficient here.
                    let model3 = {}, model4 = {}, results = [];
                    _router.addModel('m3', model3);
                    _router.addModel('m4', model4);
                    let singleModelRouter = _router.createModelRouter('m3');
                    let subject = singleModelRouter.createSubject();
                    let stream = singleModelRouter.createObservable(
                        observer => {
                            if (_router.isOnDispatchLoopFor('m3')) {
                                subject.subscribe(observer);
                            }
                        }
                    );
                    stream
                        .streamFor('m4')
                        .subscribe(
                            i => {
                                if (_router.isOnDispatchLoopFor('m4')) {
                                    results.push(i);
                                }
                            }
                        );
                    subject.onNext('aValue');
                    expect(results.length).toEqual(1);
                    expect(results[0]).toEqual('aValue');
                });
            });
        });
    });
});