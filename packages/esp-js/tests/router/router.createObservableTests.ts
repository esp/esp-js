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
import {ModelBuilder} from '../../src/model/modelBuilder';

describe('Router', () => {

    describe('.createObservableFor()', () => {

        describe('model event workflow', () => {

            let _router: esp.Router, _workflowActions: string[];
            let _model1Id = 'm1', _model2Id = 'm2';
            let _priceSubject1: esp.Subject<any>;

            beforeEach(() => {
                _router = new esp.Router();
                _workflowActions = [];
                _priceSubject1 = _router.createSubject();

                new ModelBuilder(_router, _model1Id, {})
                    .withPreEventProcessor(() => { _workflowActions.push(`preProcess-${_model1Id}`); })
                    .withPostEventProcessor(() => { _workflowActions.push(`postProcess-${_model1Id}`); })
                    .registerWithRouter();

                new ModelBuilder(_router, _model2Id, {})
                    .withPreEventProcessor(() => { _workflowActions.push(`preProcess-${_model2Id}`); })
                    .withPostEventProcessor(() => { _workflowActions.push(`postProcess-${_model2Id}`); })
                    .registerWithRouter();
            });

            function getPrices() {
                return _router.createObservableFor(
                    _model1Id,
                    observer => {
                        _workflowActions.push(`obsCreate-${_model1Id}`);
                        let subscription = _priceSubject1.subscribe(observer);
                        return () => {
                            _workflowActions.push(`disposed-${_model1Id}`);
                            subscription.dispose();
                        };
                    }
                );
            }

            it('subscribes on correct dispatch loop', () => {
                getPrices()
                    .streamFor(_model2Id)
                    .subscribe(o => {});
                expect(_workflowActions).toEqual(['preProcess-m1', 'obsCreate-m1', 'postProcess-m1']);
            });

            it('notifies on correct dispatch loop', () => {
                getPrices()
                    .streamFor(_model2Id)
                    .subscribe(
                        i => {
                            if (_router.isOnDispatchLoopFor(_model2Id)) {
                                _workflowActions.push(`observerCalled-${i}`);
                            }
                        }
                    );
                _workflowActions.length = 0; // clear initial subscribe workflows
                _priceSubject1.onNext('aPrice');
                expect(_workflowActions).toEqual(['preProcess-m2', 'observerCalled-aPrice', 'postProcess-m2']);
            });

            it('completes on correct dispatch loop', () => {
                getPrices()
                    .streamFor(_model2Id)
                    .subscribe(
                        o => {
                            _workflowActions.push('observerCalled'); // shouldn't be hit
                        },
                        () => {
                            if (_router.isOnDispatchLoopFor(_model2Id)) {
                                _workflowActions.push('completed');
                            }
                        }
                    );
                _workflowActions.length = 0; // clear initial subscribe workflows
                _priceSubject1.onCompleted();
                expect(_workflowActions).toEqual(['preProcess-m2', 'completed', 'postProcess-m2']);
            });

            it('disposes on correct dispatch loop', () => {
                let subscription = getPrices()
                    .streamFor(_model2Id)
                    .subscribe(o => {});
                _workflowActions.length = 0; // clear initial subscribe workflows
                subscription.dispose();
                expect(_workflowActions).toEqual(['preProcess-m1', 'disposed-m1', 'postProcess-m1']);
            });

            describe('single model router', () => {
                it('honours same workflow as full router', () => {
                    let results = [];
                    new ModelBuilder(_router, 'm3', {}).registerWithRouter();
                    new ModelBuilder(_router, 'm4', {}).registerWithRouter();
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
