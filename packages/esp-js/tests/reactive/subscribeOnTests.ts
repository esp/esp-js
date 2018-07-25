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

describe('.subscribeOn', () => {
    let _router;
    let _testModel1;
    let _workflowActions;
    let _routerSubject;
    let _routerObservable;

    beforeEach(() => {
        _router = new esp.Router();
        _workflowActions = [];
        _testModel1 = { modelId: 'modeliId' };
        _router.addModel(_testModel1.modelId, _testModel1);
        _routerSubject = _router.createSubject();
        _routerObservable = _routerSubject.asRouterObservable();
    });

    it('throws if modelId is undefined', () => {
        expect(() => {
            _routerObservable
                .subscribeOn(undefined)
                .subscribe(o => {});
        }).toThrow(new Error('modelId must be a string'));
    });

    it('throws if router is null', () => {
        expect(() => {
            _routerObservable
                .subscribeOn(null)
                .subscribe(o => {});
        }).toThrow(new Error('modelId must be a string'));
    });

    it('throws if modelid is empty', () => {
        expect(() => {
            _routerObservable
                .subscribeOn('')
                .subscribe(o => {});
        }).toThrow(new Error('modelId must not be empty'));
    });

    it('subscribes to the stream on the correct models dispatch loop', () => {
        let receivedUpdates = [];
        // have to use esp.Observable.create here to get a hook at subscription time
        esp.Observable.create(o => {
            let onCorrectDispatchLoop = _router.isOnDispatchLoopFor(_testModel1.modelId);
            receivedUpdates.push(onCorrectDispatchLoop);

        }).asRouterObservable(_router)
            .subscribeOn(_testModel1.modelId)
            .subscribe(i => {
                receivedUpdates.push({}); // shouldn't get hit
            });
        expect(receivedUpdates.length).toEqual(1);
        expect(receivedUpdates[0]).toEqual(true);
    });

    it('disposes the stream on the correct dispatch loop', () => {
        let receivedUpdates = [];
        // have to use esp.Observable.create here to get a hook at subscription time
        let disposable = esp.Observable.create(o => {
            let onCorrectDispatchLoop = _router.isOnDispatchLoopFor(_testModel1.modelId);
            receivedUpdates.push(onCorrectDispatchLoop);
            return () => {
                let disposeOnCorrectDispatchLoop = _router.isOnDispatchLoopFor(_testModel1.modelId);
                receivedUpdates.push(disposeOnCorrectDispatchLoop);
            };
        }).asRouterObservable(_router)
            .subscribeOn(_testModel1.modelId)
            .subscribe(i => {
                receivedUpdates.push({}); // shouldn't get hit
            });
        disposable.dispose();
        expect(receivedUpdates.length).toEqual(2);
        expect(receivedUpdates[1]).toEqual(true);
    });
});