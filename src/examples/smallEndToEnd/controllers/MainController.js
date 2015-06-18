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
import esp from '../../../esp.js';
class MainController extends esp.model.DisposableBase {
    constructor(router) {
        super();
        this._router = router;
    }
    start() {
        this._syncWithModel();

        // simulate a user changing something, anything that wants to change the model does so via an event,
        // perhaps a controller sends one in response to a user action (if used in the GUI), or a service receiving requests off the
        // network publishes one (if used on the server)
        setTimeout(() => {
           this._router.publishEvent("modelId1", "userChangedNotionalEvent", { notional: 1000000 });
        }, 6000);
    }
    _syncWithModel() {
        this.addDisposable(
            this._router.getModelObservable("modelId1").observe(model => {
                console.log("New model received, [%s]", JSON.stringify(model));
            })
        );
    }
}
export default MainController;