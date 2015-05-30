"use strict";

import esp from '../../../../esp-js.js';

class NotionalEventProcessor extends esp.model.DisposableBase {
    constructor(router) {
        super();
        this._router = router;
    }
    start() {
        this._observeInitEvent();
        this._observeUserChangedNotionalEvent();
    }
    _observeInitEvent() {
        this.addDisposable(this._router
            .getEventObservable("modelId1", 'initEvent')
            .observe((model, event) => {
                // set the default notional
                model.notional.value = event.notional;
            })
        );
    }
    _observeUserChangedNotionalEvent() {
        this.addDisposable(this._router
            .getEventObservable("modelId1", 'userChangedNotionalEvent')
            .observe((model, event)  => {
                console.log("Processing userChangedNotionalEvent event");
                model.notional.value = event.notional;
            })
        );
    }
}

export default NotionalEventProcessor;