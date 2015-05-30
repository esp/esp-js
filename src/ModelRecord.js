import Guard from './Guard';

class ModelRecord {
    // parentModelId is undefined if it's the root
    constructor(parentModelId, modelId, model, options) {
        this._parentModelId = parentModelId;
        this._modelId = modelId;
        this._model = model;
        this._eventQueue = [];
        this._hasChanges = false;
        this._wasRemoved = false;
        this._runPreEventProcessor = this._createEventProcessor("preEventProcessor", options ? options.preEventProcessor : undefined);
        this._runPostEventProcessor = this._createEventProcessor("postEventProcessor", options ? options.postEventProcessor : undefined);
        this._childrenIds = [];
    }
    get parentModelId() {
        return this._parentModelId;
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
    get childrenIds() {
        return this._childrenIds;
    }
    _createEventProcessor(name, processor) {
        if(processor) {
            let isValid = typeof processor === 'function' || (typeof processor.process === 'function');
            Guard.isTrue(isValid, name + " should be a function or an object with a process() function");
            return (model, event, context) => {
                // I guess it's possible the shape of the processor changed since we validated it, hence the recheck, another option could be to bind the initial value and always use that.
                if(typeof processor === 'function') {
                    processor(model, event, context);
                } else if(typeof processor.process === 'function') {
                    processor.process(model, event, context);
                } else {
                    throw new Error(name + " is neither a function or an object with a process() method");
                }
            };
        }
        return () => { /* noop processor */  };
    }
}

export default ModelRecord;