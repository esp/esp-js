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
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 // notice_end

import {EventProcessor} from './eventProcessorDelegate';
import {ModelOptions} from './modelOptions';

export class ModelRecord {
    private _modelId: string;
    private _model: any;
    private _eventQueue: any[];
    private _hasChanges: boolean;
    private _wasRemoved: boolean;
    private _runPreEventProcessor: EventProcessor;
    private _runPostEventProcessor: EventProcessor;

    constructor(modelId: string, model: any, options?: ModelOptions) {
        this._modelId = modelId;
        this._model = model;
        this._eventQueue = [];
        this._hasChanges = false;
        this._wasRemoved = false;
        this._runPreEventProcessor = this._createEventProcessor('preEventProcessor', 'preProcess', options ? options.preEventProcessor : undefined);
        this._runPostEventProcessor = this._createEventProcessor('postEventProcessor', 'postProcess', options ? options.postEventProcessor : undefined);
    }
    public get modelId() {
        return this._modelId;
    }
    public get model() {
        return this._model;
    }
    public get eventQueue() {
        return this._eventQueue;
    }
    public get hasChanges() {
        return this._hasChanges;
    }
    public set hasChanges(value) {
        this._hasChanges = value;
    }
    public get wasRemoved() {
        return this._wasRemoved;
    }
    public set wasRemoved(value) {
        this._wasRemoved = value;
    }
    public get runPreEventProcessor() {
        return this._runPreEventProcessor;
    }
    public get runPostEventProcessor() {
        return this._runPostEventProcessor;
    }
    _createEventProcessor(name, modelProcessMethod, externalProcessor): EventProcessor {
        let externalProcessor1 = (model, eventsProcessed) => { /*noop */ };
        if(typeof externalProcessor !== 'undefined') {
            if(typeof externalProcessor === 'function') {
                externalProcessor1 = (model, eventsProcessed) => {
                    externalProcessor(model, eventsProcessed);
                };
            } else if (typeof externalProcessor.process === 'function') {
                externalProcessor1 = (model, eventsProcessed) => {
                    externalProcessor.process(model, eventsProcessed);
                };
            } else {
                throw new Error(name + ' on the options parameter is neither a function nor an object with a process() method');
            }
        }
        let modelProcessor = (model, eventsProcessed) => {
            if(model[modelProcessMethod] && (typeof model[modelProcessMethod] === 'function')) {
                model[modelProcessMethod](eventsProcessed);
            }
        };
        return (model, eventsProcessed) => {
            externalProcessor1(model, eventsProcessed);
            modelProcessor(model, eventsProcessed);
        };
    }
}