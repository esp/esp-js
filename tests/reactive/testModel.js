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

export default class TestModel {
    constructor(id, router, workflowActions) {
        this.modelId = id;
        this.workflowActions = workflowActions || [];
        this._router = router;
        this.priceSubject = new esp.Subject();
    }

    registerWitRouter() {
        this._router.addModel(this.modelId, this);
    }

    preProcess() {
        this.workflowActions.push(`preProcess-${this.modelId}`);
    }

    getPrices() {
        return esp.Observable.create(
            observer => {
                this.workflowActions.push(`obsCreate-${this.modelId}`);
                var subscription = this.priceSubject.subscribe(observer);
                return () => {
                    this.workflowActions.push(`disposed-${this.modelId}`);
                    subscription.dispose();
                };
            }
        );
    }

    postProcess() {
        this.workflowActions.push(`postProcess-${this.modelId}`);
    }

    pushPrice(p) {
        this.priceSubject.onNext(p);
    }
}