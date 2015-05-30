"use strict";

import esp from '../../../../esp-js.js';

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