// notice_start
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
 // notice_end

import esp from '../../../../esp.js';

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