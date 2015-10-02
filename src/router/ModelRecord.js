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

import { Guard } from '../system';

class ModelRecord {
    // parentModelId is undefined if it's the root
    constructor(modelId, model, options) {
        this._modelId = modelId;
        this._model = model;
        this._eventQueue = [];
        this._hasChanges = false;
        this._wasRemoved = false;
        this._runPreEventProcessor = this._createEventProcessor("preEventProcessor", 'preProcess', options ? options.preEventProcessor : undefined);
        this._runPostEventProcessor = this._createEventProcessor("postEventProcessor", 'postProcess', options ? options.postEventProcessor : undefined);
    }
    get modelId() {
        return this._modelId;
    }
    get model() {
        return this._model;
    }
    get eventQueue() {
        return this._eventQueue;
    }
    get hasChanges() {
        return this._hasChanges;
    }
    set hasChanges(value) {
        this._hasChanges = value;
    }
    get wasRemoved() {
        return this._wasRemoved;
    }
    set wasRemoved(value) {
        this._wasRemoved = value;
    }
    get runPreEventProcessor() {
        return this._runPreEventProcessor;
    }
    get runPostEventProcessor() {
        return this._runPostEventProcessor;
    }
    _createEventProcessor(name, modelProcessMethod, processor) {
        return (model) => {
            // I guess it's possible the shape of the processor changed since we validated it, hence the recheck, another option could be to bind the initial value and always use that.
            if(typeof processor !== 'undefined') {
                if (typeof processor === 'function') {
                    processor(model);
                } else if (processor.process && typeof processor.process === 'function') {
                    processor.process(model);
                } else {
                    throw new Error(name + " is neither a function or an object with a process() method");
                }
            }
            if(model[modelProcessMethod] && (typeof model[modelProcessMethod] === 'function')) {
                model[modelProcessMethod]();
            }
        };
    }
}

export default ModelRecord;