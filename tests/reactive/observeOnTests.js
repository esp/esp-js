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
import TestModel from './testModel';

describe('.observeOn', () => {
    var _router;
    var _testModel1;
    var _testModel2;
    var _workflowActions;

    beforeEach(() => {
        _router = new esp.Router();
        _workflowActions = [];
        _testModel1 = new TestModel('m1', _router, _workflowActions);
        _testModel1.registerWitRouter();
        _testModel2 = new TestModel('m2', _router, _workflowActions);
        _testModel2.registerWitRouter();
    });

    it('observeOn throws if router is undefined', () => {
        expect(() => {
            return esp.Observable
                .create(o => { })
                .observeOn(undefined, 'foo')
                .observe(o => {});
        }).toThrow(new Error('router must be defined'));
    });

    it('observeOn throws if router is null', () => {
        expect(() => {
            return esp.Observable
                .create(o => { })
                .observeOn(null, 'foo')
                .observe(o => {});
        }).toThrow(new Error('router must be defined'));
    });

    it('observeOn throws if modelid is undefined', () => {
        expect(() => {
            return esp.Observable
                .create(o => { })
                .observeOn(_router, undefined)
                .observe(o => {});
        }).toThrow(new Error('modelId must be a string'));
    });

    it('observeOn passes onComplete up it\'s dispose chain', () => {
        _testModel1
            .getPrices()
            .observeOn(_router, _testModel1.modelId)
            .where(p => p.pair === 'EURUSD')
            .observe(
                p => {
                    _workflowActions.push(`priceReceived-${p.pair}-${p.price}`);
                },
                () => {
                    _workflowActions.push('completed');
                }
            );

        _testModel1.pushPrice({pair:'EURUSD', price:1});
        expect(_workflowActions).toEqual(['obsCreate-m1', 'preProcess-m1', 'priceReceived-EURUSD-1', 'postProcess-m1']);
        _testModel1.priceSubject.onCompleted();
        expect(_workflowActions).toEqual([
            'obsCreate-m1',
            'preProcess-m1', 'priceReceived-EURUSD-1', 'postProcess-m1',
            'preProcess-m1', 'completed', 'postProcess-m1'
        ]);

        _workflowActions.length = 0;
        _testModel1.pushPrice({pair:'EURUSD', price:2});
        expect(_workflowActions.length).toEqual(0);
    });

    it('observeOn to the stream on models dispatch loop', () => {
        _testModel1
            .getPrices()
            .observeOn(_router, _testModel1.modelId)
            .observe(o => {
                _testModel1.workflowActions.push('observerCalled');
            });
        _testModel1.pushPrice({pair:'EURUSD', price:1});
        expect(_workflowActions).toEqual(['obsCreate-m1', 'preProcess-m1', 'observerCalled', 'postProcess-m1']);
    });

    it('observeOn and subscribeOn run on correct dispatch loop', () => {
        let subscription = _testModel1
            .getPrices()
            .subscribeOn(_router, _testModel1.modelId)
            .observeOn(_router, _testModel2.modelId)
            .observe(o => {
               _testModel1.workflowActions.push('observerCalled');
            });
        _testModel1.pushPrice({pair:'EURUSD', price:1});
        subscription.dispose();
        expect(_workflowActions).toEqual([
            'preProcess-m1', 'obsCreate-m1', 'postProcess-m1',
            'preProcess-m2', 'observerCalled', 'postProcess-m2',
            'preProcess-m1', 'disposed-m1', 'postProcess-m1'
        ]);
    });
});