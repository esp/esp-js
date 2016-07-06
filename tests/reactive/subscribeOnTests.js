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

describe('.subscribeOn', () => {
    var _router;
    var _testModel1;

    beforeEach(() => {
        _router = new esp.Router();
        _testModel1 = new TestModel('m1', _router);
        _testModel1.registerWitRouter();
    });

    it('subscribeOn throws if router is undefined', () => {
        expect(() => {
            return esp.Observable
                .create(o => { })
                .subscribeOn(undefined, 'foo')
                .observe(o => {});
        }).toThrow(new Error('router must be defined'));
    });

    it('subscribeOn throws if router is null', () => {
        expect(() => {
            return esp.Observable
                .create(o => { })
                .subscribeOn(null, 'foo')
                .observe(o => {});
        }).toThrow(new Error('router must be defined'));
    });

    it('subscribeOn throws if modelid is undefined', () => {
        expect(() => {
            return esp.Observable
                .create(o => { })
                .subscribeOn(_router, undefined)
                .observe(o => {});
        }).toThrow(new Error('modelId must be a string'));
    });

    it('subscribeOn passes disposable up it\'s dispose chain', () => {
        let receivedPrices = [];
        let disposable = _testModel1
            .getPrices()
            .subscribeOn(_router, _testModel1.modelId)
            .where(p => p.pair === 'EURUSD')
            .observe(p => {
                receivedPrices.push(`priceReceived-${p.pair}-${p.price}`);
            });
        _testModel1.pushPrice({pair:'EURUSD', price:1});
        expect(receivedPrices).toEqual(['priceReceived-EURUSD-1']);
        disposable.dispose();
        _testModel1.pushPrice({pair:'EURUSD', price:2});
        expect(receivedPrices).toEqual(['priceReceived-EURUSD-1']);
    });

    it('subscribes to the stream on models dispatch loop', () => {
        _testModel1
            .getPrices()
            .subscribeOn(_router, _testModel1.modelId)
            .observe(o => {
                _testModel1.workflowActions.push('observerCalled');
            });
        expect(_testModel1.workflowActions).toEqual(['preProcess-m1', 'obsCreate-m1', 'postProcess-m1']);
    });
});