/*
 * Copyright 2015 Keith Woods
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

import esp from '../../../../esp.js';

class StaticDataEventProcessor extends esp.model.DisposableBase {
    constructor(router) {
        super();
        this._router = router;
    }
    start() {
        this._observeInitEvent();
    }
    _observeInitEvent() {
        this.addDisposable(this._router
            .getEventObservable("modelId1", 'initEvent')
            .beginWork((model, event, eventContext, onResultsReceived) => {
                // fake getting accounts async
                model.longRunningOperationCount ++;
                setTimeout(() => {
                    console.log("Accounts received async, posting");
                    onResultsReceived({ accounts: ['Account1', 'Account2']});
                }, 4000);
            })
            .observe((model, event) => {
                console.log("Applying accounts to the model");
                model.longRunningOperationCount --;
                model.accounts.value = event.results.accounts;
            })
        );
    }
}

export default StaticDataEventProcessor;