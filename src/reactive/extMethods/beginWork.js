/*
 * Copyright 2015 Keith Woods
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

import uuid from 'node-uuid';
import Observable from '../Observable';
import model  from '../../model';
import system from '../../system';
import { Guard, utils, logger, disposables } from '../../system';

var CompositeDisposable = disposables.CompositeDisposable;
var DictionaryDisposable = disposables.DictionaryDisposable;
var AsyncWorkCompleteEvent = model.events.AsyncWorkCompleteEvent;

var _asyncWorkCompleteEventName = 'asyncWorkCompleteEvent';

/*
* Note: experimental, needs more test, doesn't work with .take()
*
* Used for asynchronous operations from event processors, this should only be used on event streams, a future revision will likely
* enforce this or ensure the method only exists in the correct context.
*
* Note: this function may be removed in the future in favour of a pipeline that fully supports async interactions and is
* more compatible with other libraries.
* */
Observable.prototype.beginWork = function(action) {
    Guard.isDefined(action, 'action required, format: (ec : EventContext, done : (result : any) => { })');
    var source = this;
    var disposables = new CompositeDisposable();
    var dictionaryDisposable = new DictionaryDisposable();
    disposables.add(dictionaryDisposable);
    var observe = observer => {
        disposables.add(
            source.observe(
                (model, event, eventContext) => {
                    let modelId = eventContext.modelId;
                    let operationId = uuid.v1();
                    var disposable = this._router
                        .getEventObservable(modelId, _asyncWorkCompleteEventName)
                        .where ((m, e) => e.operationId === operationId)
                        .observe((m, e, ec) => {
                            if(!disposables.isDisposed) {
                                if(e.isFinished) {
                                    disposable.dispose();
                                    dictionaryDisposable.remove(operationId);
                                }
                                observer.onNext(m, e, ec);
                            }
                        });
                    var onResultsReceived = (result, isFinished) => {
                        if(!disposables.isDisposed) {
                            isFinished = isFinished === 'undefined' ? true : isFinished;
                            var asyncWorkCompleteEvent = new AsyncWorkCompleteEvent(operationId, result, isFinished);
                            // publish the async results back through the router so the full event workflow is triggered
                            source._router.publishEvent(modelId, _asyncWorkCompleteEventName, asyncWorkCompleteEvent);
                        }
                    };
                    dictionaryDisposable.add(operationId, disposable);
                    action(model, event ,eventContext, onResultsReceived);
                },
                observer.onError.bind(observer),
                () => observer.onCompleted()
            )
        );
        return disposables;
    };
    return new Observable(observe, this._router);
};