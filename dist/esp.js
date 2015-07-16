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

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["esp"] = factory();
	else
		root["esp"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
    
    "use strict";
    
    exports.EventStage = __webpack_require__(1);
    exports.Router = __webpack_require__(2);
    exports.model = __webpack_require__(24);

/***/ },
/* 1 */
/***/ function(module, exports) {

    "use strict";
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var EventStage = (function () {
      function EventStage() {
        _classCallCheck(this, EventStage);
      }
    
      _createClass(EventStage, null, {
        preview: {
          get: function () {
            return "preview";
          }
        },
        normal: {
          get: function () {
            return "normal";
          }
        },
        committed: {
          get: function () {
            return "committed";
          }
        }
      });
    
      return EventStage;
    })();
    
    module.exports = EventStage;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var EventContext = _interopRequire(__webpack_require__(3));
    
    var EventStage = _interopRequire(__webpack_require__(1));
    
    var ModelRecord = _interopRequire(__webpack_require__(12));
    
    var State = _interopRequire(__webpack_require__(13));
    
    var Status = _interopRequire(__webpack_require__(14));
    
    var ModelRouter = _interopRequire(__webpack_require__(15));
    
    var _reactiveIndex = __webpack_require__(16);
    
    var Subject = _reactiveIndex.Subject;
    var Observable = _reactiveIndex.Observable;
    
    var SubModelChangedEvent = __webpack_require__(25).SubModelChangedEvent;
    
    var _system = __webpack_require__(4);
    
    var Guard = _system.Guard;
    var utils = _system.utils;
    var logger = _system.logger;
    
    var _log = logger.create("Router");
    
    var Router = (function () {
        function Router() {
            _classCallCheck(this, Router);
    
            this._models = {};
            this._modelUpdateSubjects = {};
            this._modelEventSubjects = {};
            this._haltingException = undefined;
            this._state = new State();
        }
    
        _createClass(Router, {
            registerModel: {
                value: function registerModel(modelId, model, options) {
                    this._throwIfHalted();
                    Guard.isString(modelId, "The modelId argument should be a string");
                    Guard.isDefined(model, "THe model argument must be defined");
                    if (options) Guard.isObject(options, "The options argument should be an object");
                    Guard.isFalsey(this._models[modelId], "The model with id [" + modelId + "] is already registered");
                    this._models[modelId] = new ModelRecord(undefined, modelId, model, options);
                }
            },
            addChildModel: {
                value: function addChildModel(parentModelId, childModelId, model, options) {
                    this._throwIfHalted();
                    Guard.isString(parentModelId, "The parentModelId argument should be a string");
                    Guard.isString(childModelId, "The childModelId argument should be a string");
                    Guard.isDefined(model, "The model argument should be defined");
                    if (options) Guard.isObject(options, "The options argument should be an object");
    
                    var parentModelRecord = this._models[parentModelId];
                    if (!parentModelRecord) {
                        throw new Error("Parent model with id [" + parentModelId + "] is not registered");
                    }
                    this._models[childModelId] = new ModelRecord(parentModelId, childModelId, model, options);
                    parentModelRecord.childrenIds.push(childModelId);
                }
            },
            removeModel: {
                value: function removeModel(modelId) {
                    Guard.isString(modelId, "The modelId argument should be a string");
    
                    var modelRecord = this._models[modelId];
                    if (modelRecord) {
                        modelRecord.wasRemoved = true;
                        delete this._models[modelId];
                        modelRecord.eventQueue.length = 0;
                        var modelUpdateSubjects = this._modelUpdateSubjects[modelId];
                        if (modelUpdateSubjects) {
                            delete this._modelUpdateSubjects[modelId];
                            modelUpdateSubjects.onCompleted();
                        }
                        var modelEventSubjects = this._modelEventSubjects[modelId];
                        if (modelEventSubjects) {
                            delete this._modelEventSubjects[modelId];
                            for (var p in modelEventSubjects) {
                                if (modelEventSubjects.hasOwnProperty(p)) {
                                    var eventSubjects = modelEventSubjects[p];
                                    eventSubjects.preview.onCompleted();
                                    eventSubjects.normal.onCompleted();
                                    eventSubjects.committed.onCompleted();
                                }
                            }
                        }
                        for (var i = 0, len = modelRecord.childrenIds.length; i < len; i++) {
                            var childModelId = modelRecord.childrenIds[i];
                            this.removeModel(childModelId);
                        }
                        if (modelRecord.parentModelId) {
                            var parentModelRecord = this._models[modelRecord.parentModelId];
                            // parentModelRecord will be undefined if the parent was first removed
                            if (parentModelRecord) {
                                for (var i = 0; i < parentModelRecord.childrenIds.length; i++) {
                                    if (parentModelRecord.childrenIds[i] === modelId) {
                                        parentModelRecord.childrenIds.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            publishEvent: {
                value: function publishEvent(modelId, eventType, event) {
                    Guard.isString(modelId, "The modelId argument should be a string");
                    Guard.isString(eventType, "The eventType argument should be a string");
                    Guard.isDefined(event, "The event argument must be defined");
    
                    this._throwIfHalted();
                    if (this._state.currentStatus === Status.EventExecution) {
                        throw new Error("You can not publish further events when performing an event execution. modelId1: [" + modelId + "], eventType:[" + eventType + "]");
                    }
                    var modelRecord = this._models[modelId];
                    if (typeof modelRecord === "undefined") {
                        throw new Error("Can not publish event of type [" + eventType + "] as model with id [" + modelId + "] not registered");
                    } else {
                        try {
                            modelRecord.eventQueue.push({ eventType: eventType, event: event });
                            this._purgeEventQueues();
                        } catch (err) {
                            this._halt(err);
                        }
                    }
                }
            },
            broadcastEvent: {
                value: function broadcastEvent(eventType, event) {
                    Guard.isString(eventType, "The eventType argument should be a string");
                    Guard.isDefined(event, "The event argument should be defined");
                    for (var modelId in this._models) {
                        if (this._models.hasOwnProperty(modelId)) {
                            var modelRecord = this._models[modelId];
                            modelRecord.eventQueue.push({ eventType: eventType, event: event });
                            this._purgeEventQueues();
                        }
                    }
                }
            },
            executeEvent: {
                value: function executeEvent(eventType, event) {
                    var _this = this;
    
                    this._throwIfHalted();
                    Guard.isString(eventType, "The eventType argument should be a string");
                    Guard.isDefined(event, "The event argument should be defined");
    
                    this._state.executeEvent(function () {
                        var eventContext = new EventContext(_this._state.currentModelId, eventType, event);
                        _this._dispatchEventToEventProcessors(_this._state.currentModelId, _this._state.currentModel, event, eventType, eventContext);
                    });
                }
            },
            getEventObservable: {
                value: function getEventObservable(modelId, eventType, stage) {
                    var _this = this;
    
                    return Observable.create(function (o) {
                        _this._throwIfHalted();
                        Guard.isString(modelId, "The modelId argument should be a string");
                        Guard.isDefined(modelId, "The modelId argument should be defined");
                        Guard.isDefined(eventType, "The eventType argument should be defined");
    
                        if (stage) {
                            Guard.isString(stage, "The stage argument should be a string");
                            Guard.isTrue(stage === EventStage.preview || stage === EventStage.normal || stage === EventStage.committed, "The stage argument value of [" + stage + "] is incorrect. It should be preview, normal or committed.");
                        } else {
                            stage = EventStage.normal;
                        }
                        var subjects = _this._getModelsEventSubjects(modelId, eventType);
                        var subject = subjects[stage];
                        return subject.observe(o);
                    }, this);
                }
            },
            getModelObservable: {
                value: function getModelObservable(modelId) {
                    var _this = this;
    
                    return Observable.create(function (o) {
                        _this._throwIfHalted();
                        Guard.isString(modelId, "The modelId should be a string");
    
                        var updateSubject = _this._modelUpdateSubjects[modelId];
                        if (typeof updateSubject === "undefined") {
                            updateSubject = new Subject(_this);
                            _this._modelUpdateSubjects[modelId] = updateSubject;
                        }
                        return updateSubject.observe(o);
                    }, this);
                }
            },
            createModelRouter: {
                value: function createModelRouter(targetModelId) {
                    Guard.isString(targetModelId, "The targetModelId argument should be a string");
                    return new ModelRouter(this, targetModelId);
                }
            },
            _getModelsEventSubjects: {
                value: function _getModelsEventSubjects(modelId, eventType) {
                    var modelEventSubject = this._modelEventSubjects[modelId];
                    if (typeof modelEventSubject === "undefined") {
                        modelEventSubject = {};
                        this._modelEventSubjects[modelId] = modelEventSubject;
                    }
                    var subjects = modelEventSubject[eventType];
                    if (typeof subjects === "undefined") {
                        subjects = {
                            preview: new Subject(this),
                            normal: new Subject(this),
                            committed: new Subject(this)
                        };
                        modelEventSubject[eventType] = subjects;
                    }
                    return subjects;
                }
            },
            _purgeEventQueues: {
                value: function _purgeEventQueues() {
                    if (this._state.currentStatus === Status.Idle) {
                        var modelRecord = this._getNextModelRecordWithQueuedEvents();
                        var hasEvents = true;
    
                        // TODO -> Explanation of why we have the two while loops
                        while (hasEvents) {
                            while (hasEvents) {
                                this._state.moveToPreProcessing(modelRecord.modelId, modelRecord.model);
                                var eventRecord = modelRecord.eventQueue.shift();
                                if (modelRecord.model.unlock && typeof modelRecord.model.unlock === "function") {
                                    modelRecord.model.unlock();
                                }
                                var eventContext = new EventContext(modelRecord.modelId, eventRecord.eventType, eventRecord.event);
                                modelRecord.runPreEventProcessor(modelRecord.model, eventRecord.event, eventContext);
                                if (!modelRecord.wasRemoved) {
                                    if (!eventContext.isCanceled) {
                                        this._state.moveToEventDispatch();
                                        while (hasEvents) {
                                            var wasDispatched = this._dispatchEventToEventProcessors(modelRecord.modelId, modelRecord.model, eventRecord.event, eventRecord.eventType, eventContext);
                                            if (modelRecord.wasRemoved) break;
                                            if (!modelRecord.hasChanges && wasDispatched) {
                                                modelRecord.hasChanges = true;
                                            }
                                            hasEvents = modelRecord.eventQueue.length > 0;
                                            if (hasEvents) {
                                                eventRecord = modelRecord.eventQueue.shift();
                                                eventContext = new EventContext(modelRecord.modelId, eventRecord.eventType, eventRecord.event);
                                            }
                                        } // keep looping until any events from the dispatch to processors stage are processed
                                    }
                                    if (!modelRecord.wasRemoved) {
                                        this._state.moveToPostProcessing();
                                        modelRecord.runPostEventProcessor(modelRecord.model, eventRecord.event, eventContext);
                                        if (modelRecord.model.lock && typeof modelRecord.model.lock === "function") {
                                            modelRecord.model.lock();
                                        }
                                    }
                                }
                                if (modelRecord.parentModelId) {
                                    // if we're currently processing a child model, we raise a 'modelChangedEvent' to the parent
                                    // and set it as the next model to process.
                                    this.publishEvent(modelRecord.parentModelId, "modelChangedEvent", new SubModelChangedEvent(modelRecord.modelId, eventRecord.eventType));
                                    modelRecord = this._models[modelRecord.parentModelId];
                                    hasEvents = true;
                                } else {
                                    modelRecord = this._getNextModelRecordWithQueuedEvents();
                                    hasEvents = typeof modelRecord !== "undefined";
                                }
                            } // keep looping until any events raised during post event processing OR event that have come in for other models are processed
                            this._state.moveToDispatchModelUpdates();
                            this._dispatchModelUpdates();
                            modelRecord = this._getNextModelRecordWithQueuedEvents();
                            hasEvents = typeof modelRecord !== "undefined";
                        } // keep looping until any events from the dispatch updates stages are processed
                        this._state.moveToIdle();
                    }
                }
            },
            _dispatchEventToEventProcessors: {
                value: function _dispatchEventToEventProcessors(modelId, model, event, eventType, eventContext) {
                    var dispatchEvent = function (model1, event1, context, subject) {
                        var wasDispatched = false;
                        if (subject.getObserverCount() > 0) {
                            // note: if the model was removed by an observer the subject will be completed so subsequent observers won't get the event
                            subject.onNext(model1, event1, context);
                            if (subject.hasError) {
                                throw subject.error;
                            }
                            wasDispatched = true;
                        }
                        return wasDispatched;
                    };
    
                    var eventSubjects = this._getModelsEventSubjects(modelId, eventType);
                    var wasDispatched = dispatchEvent(model, event, eventContext, eventSubjects.preview);
                    if (eventContext.isCommitted) {
                        throw new Error("You can't commit an event at the preview stage. Event: [" + eventContext.eventType + "], ModelId: [" + modelId + "]");
                    }
                    if (!eventContext.isCanceled) {
                        wasDispatched = dispatchEvent(model, event, eventContext, eventSubjects.normal);
                        if (eventContext.isCanceled) {
                            throw new Error("You can't cancel an event at the normal stage. Event: [" + eventContext.eventType + "], ModelId: [" + modelId + "]");
                        }
                        if (wasDispatched && eventContext.isCommitted) {
                            dispatchEvent(model, event, eventContext, eventSubjects.committed);
                            if (eventContext.isCanceled) {
                                throw new Error("You can't cancel an event at the committed stage. Event: [" + eventContext.eventType + "], ModelId: [" + modelId + "]");
                            }
                        }
                    }
                    return wasDispatched;
                }
            },
            _dispatchModelUpdates: {
                value: function _dispatchModelUpdates() {
                    var updates = [],
                        modelUpdateSubject = undefined;
                    for (var modelId in this._models) {
                        if (this._models.hasOwnProperty(modelId)) {
                            var modelRecord = this._models[modelId];
                            if (modelRecord.hasChanges) {
                                modelRecord.hasChanges = false;
                                updates.push(modelRecord);
                            }
                        }
                    }
                    for (var i = 0, len = updates.length; i < len; i++) {
                        modelUpdateSubject = this._modelUpdateSubjects[updates[i].modelId];
                        if (typeof modelUpdateSubject !== "undefined") {
                            modelUpdateSubject.onNext(updates[i].model);
                            if (modelUpdateSubject.hasError) {
                                throw modelUpdateSubject.error;
                            }
                        }
                    }
                }
            },
            _getNextModelRecordWithQueuedEvents: {
                value: function _getNextModelRecordWithQueuedEvents() {
                    var nextModel = undefined;
                    for (var modelId in this._models) {
                        if (this._models.hasOwnProperty(modelId)) {
                            var current = this._models[modelId];
                            if (current.eventQueue.length > 0) {
                                nextModel = current;
                                break;
                            }
                        }
                    }
                    return nextModel;
                }
            },
            _throwIfHalted: {
                value: function _throwIfHalted() {
                    if (this._state.currentStatus === Status.Halted) {
                        var message = utils.format("Event router halted due to previous error [{0}]", this._haltingException);
                        throw new Error(message);
                    }
                }
            },
            _halt: {
                value: function _halt(err) {
                    this._state.moveToHalted();
                    _log.error("Router halted error: [{0}]", err);
                    this._haltingException = err;
                    throw err;
                }
            }
        });
    
        return Router;
    })();
    
    module.exports = Router;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var Guard = __webpack_require__(4).Guard;
    
    var EventContext = (function () {
        function EventContext(modelId, eventType, event) {
            _classCallCheck(this, EventContext);
    
            Guard.isString(modelId, "The modelId should be a string");
            Guard.isString(eventType, "The eventType should be a string");
            Guard.isDefined(event, "The event should be defined");
            this._modelId = modelId;
            this._eventType = eventType;
            this._event = event;
            this._isCanceled = false;
            this._isCommitted = false;
        }
    
        _createClass(EventContext, {
            isCanceled: {
                get: function () {
                    return this._isCanceled;
                }
            },
            isCommitted: {
                get: function () {
                    return this._isCommitted;
                }
            },
            modelId: {
                get: function () {
                    return this._modelId;
                }
            },
            event: {
                get: function () {
                    return this._event;
                }
            },
            eventType: {
                get: function () {
                    return this._eventType;
                }
            },
            cancel: {
                value: function cancel() {
                    if (!this._isCanceled) {
                        this._isCanceled = true;
                    } else {
                        throw new Error("event is already cancelled");
                    }
                }
            },
            commit: {
                value: function commit() {
                    if (!this._isCommitted) {
                        this._isCommitted = true;
                    } else {
                        throw "event is already committed";
                    }
                }
            }
        });
    
        return EventContext;
    })();
    
    module.exports = EventContext;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
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
    
    var disposables = _interopRequire(__webpack_require__(5));
    
    var Guard = _interopRequire(__webpack_require__(7));
    
    var logger = _interopRequireWildcard(__webpack_require__(11));
    
    var utils = _interopRequireWildcard(__webpack_require__(8));
    
    module.exports = { disposables: disposables, Guard: Guard, logger: logger, utils: utils };

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
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
    
    var CompositeDisposable = _interopRequire(__webpack_require__(6));
    
    var DictionaryDisposable = _interopRequire(__webpack_require__(10));
    
    var DisposableWrapper = _interopRequire(__webpack_require__(9));
    
    module.exports = { CompositeDisposable: CompositeDisposable, DictionaryDisposable: DictionaryDisposable, DisposableWrapper: DisposableWrapper };

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var Guard = _interopRequire(__webpack_require__(7));
    
    var DisposableWrapper = _interopRequire(__webpack_require__(9));
    
    var CompositeDisposable = (function () {
        function CompositeDisposable() {
            _classCallCheck(this, CompositeDisposable);
    
            this._disposables = [];
            this._isDisposed = false;
        }
    
        _createClass(CompositeDisposable, {
            isDisposed: {
                get: function () {
                    return this._isDisposed;
                }
            },
            add: {
                value: function add(disposable) {
                    var disposableWrapper = new DisposableWrapper(disposable);
                    if (this._isDisposed) {
                        disposableWrapper.dispose();
                        return;
                    }
                    this._disposables.push(disposableWrapper);
                }
            },
            dispose: {
                value: function dispose() {
                    if (!this._isDisposed) {
                        this._isDisposed = true;
                        for (var i = 0, len = this._disposables.length; i < len; i++) {
                            var disposable = this._disposables[i];
                            disposable.dispose();
                        }
                        this._disposables.length = 0;
                    }
                }
            }
        });
    
        return CompositeDisposable;
    })();
    
    module.exports = CompositeDisposable;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var utils = _interopRequireWildcard(__webpack_require__(8));
    
    var Guard = (function () {
        function Guard() {
            _classCallCheck(this, Guard);
        }
    
        _createClass(Guard, null, {
            isDefined: {
                value: function isDefined(value, message) {
                    if (typeof value === "undefined") {
                        doThrow(message);
                    }
                }
            },
            isFalsey: {
                value: function isFalsey(value, message) {
                    if (value) {
                        doThrow(message);
                    }
                }
            },
            lengthIs: {
                value: function lengthIs(array, length, message) {
                    if (array.length !== length) {
                        doThrow(message);
                    }
                }
            },
            lengthGreaterThan: {
                value: function lengthGreaterThan(array, expected, message) {
                    if (array.length < expected) {
                        doThrow(message);
                    }
                }
            },
            lengthIsAtLeast: {
                value: function lengthIsAtLeast(array, expected, message) {
                    if (array.length < expected) {
                        doThrow(message);
                    }
                }
            },
            isString: {
                value: function isString(value, message) {
                    if (!utils.isString(value)) {
                        doThrow(message);
                    }
                }
            },
            isTrue: {
                value: function isTrue(check, message) {
                    if (!check) {
                        doThrow(message);
                    }
                }
            },
            isFunction: {
                value: function isFunction(item, message) {
                    if (typeof item != "function") {
                        doThrow(message);
                    }
                }
            },
            isNumber: {
                value: function isNumber(value, message) {
                    if (isNaN(value)) {
                        doThrow(message);
                    }
                }
            },
            isObject: {
                value: function isObject(value, message) {
                    if (typeof value !== "object") {
                        doThrow(message);
                    }
                }
            }
        });
    
        return Guard;
    })();
    
    module.exports = Guard;
    
    function doThrow(message) {
        if (typeof message === "undefined" || message === "") {
            throw new Error("Argument error");
        }
        throw new Error(message);
    }

/***/ },
/* 8 */
/***/ function(module, exports) {

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
    
    "use strict";
    
    exports.removeAll = removeAll;
    exports.isString = isString;
    exports.format = format;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    
    function removeAll(arr, item) {
        for (var i = arr.length; i--;) {
            if (arr[i] === item) {
                arr.splice(i, 1);
            }
        }
    }
    
    function isString(value) {
        return typeof value == "string" || value instanceof String;
    }
    
    function format(formatString) {
        //Guard.isString(format, "First argument to a log function should be a string, but got [" + format + "]");
        var args = Array.prototype.slice.call(arguments, 1);
        var message = formatString.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != "undefined" ? args[number] : match;
        });
        return message;
    }

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var Guard = _interopRequire(__webpack_require__(7));
    
    var DisposableWrapper = (function () {
        function DisposableWrapper(disposable) {
            _classCallCheck(this, DisposableWrapper);
    
            Guard.isDefined(disposable, "disposable must be defined");
            var innerDisposable;
            if (typeof disposable === "function") {
                innerDisposable = { dispose: function dispose() {
                        disposable();
                    } };
            } else if (disposable.dispose && typeof disposable.dispose === "function") {
                innerDisposable = {
                    dispose: function () {
                        // at this point if something has deleted the dispose or it's not a function we just ignore it.
                        if (disposable.dispose && typeof disposable.dispose === "function") {
                            disposable.dispose();
                        }
                    }
                };
            } else {
                throw new Error("Item to dispose was neither a function nor had a dispose method.");
            }
            this._isDisposed = false;
            this._disposable = innerDisposable;
        }
    
        _createClass(DisposableWrapper, {
            isDisposed: {
                get: function () {
                    return this._isDisposed;
                }
            },
            dispose: {
                value: function dispose() {
                    if (!this._isDisposed && this._disposable) {
                        this._isDisposed = true;
                        this._disposable.dispose();
                    }
                }
            }
        });
    
        return DisposableWrapper;
    })();
    
    module.exports = DisposableWrapper;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var DisposableWrapper = _interopRequire(__webpack_require__(9));
    
    var DictionaryDisposable = (function () {
        function DictionaryDisposable() {
            _classCallCheck(this, DictionaryDisposable);
    
            this._isDisposed = false;
        }
    
        _createClass(DictionaryDisposable, {
            add: {
                value: function add(key, disposable) {
                    if (this.hasOwnProperty(key)) {
                        throw new Error("Key " + key + " already found");
                    }
                    var disposableWrapper = new DisposableWrapper(disposable);
                    if (this._isDisposed) {
                        disposableWrapper.dispose();
                        return;
                    }
                    this[key] = disposableWrapper;
                }
            },
            remove: {
                value: function remove(key) {
                    if (this.hasOwnProperty(key)) {
                        delete this[key];
                    }
                }
            },
            dispose: {
                value: function dispose() {
                    // if(!this._isDisposed) {
                    this._isDisposed = true;
                    for (var p in this) {
                        if (this.hasOwnProperty(p)) {
                            var disposable = this[p];
                            if (disposable.dispose) {
                                disposable.dispose();
                            }
                        }
                    }
                    // }
                }
            }
        });
    
        return DictionaryDisposable;
    })();
    
    module.exports = DictionaryDisposable;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
    exports.create = create;
    exports.setLevel = setLevel;
    exports.setSink = setSink;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
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
    
    var Guard = _interopRequire(__webpack_require__(7));
    
    var levels = {
        verbose: 0,
        debug: 1,
        info: 2,
        warn: 3,
        error: 4
    };
    
    var _currentLevel = levels.debug;
    
    var _sink = function (logEvent) {
        console.log("[" + logEvent.logger + "] [" + logEvent.level + "]: " + logEvent.message);
    };
    
    var Logger = (function () {
        function Logger(name) {
            _classCallCheck(this, Logger);
    
            this._name = name;
        }
    
        _createClass(Logger, {
            verbose: {
                value: function verbose(format) {
                    if (_currentLevel <= levels.verbose) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        this._log("VERBOSE", format, args);
                    }
                }
            },
            debug: {
                value: function debug(format) {
                    if (_currentLevel <= levels.debug) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        this._log("DEBUG", format, args);
                    }
                }
            },
            info: {
                value: function info(format) {
                    if (_currentLevel <= levels.info) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        this._log("INFO", format, args);
                    }
                }
            },
            warn: {
                value: function warn(format) {
                    if (_currentLevel <= levels.warn) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        this._log("WARN", format, args);
                    }
                }
            },
            error: {
                value: function error(format) {
                    if (_currentLevel <= levels.error) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        this._log("ERROR", format, args);
                    }
                }
            },
            _log: {
                value: function _log(level, format, args) {
                    Guard.isString(format, "First argument to a log function should be a string, but got [" + format + "]");
                    var message = format.replace(/{(\d+)}/g, function (match, number) {
                        return typeof args[number] != "undefined" ? args[number] : match;
                    });
                    _sink({
                        logger: this._name,
                        level: level,
                        message: message
                    });
                }
            }
        });
    
        return Logger;
    })();
    
    function create(name) {
        Guard.isDefined(name, "The name argument should be defined");
        Guard.isString(name, "The name argument should be a string");
        return new Logger(name);
    }
    
    function setLevel(level) {
        _currentLevel = level;
    }
    
    function setSink(sink) {
        Guard.isFunction(sink, "Logging sink argument must be a function");
        _sink = sink;
    }
    
    exports.levels = levels;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var Guard = __webpack_require__(4).Guard;
    
    var ModelRecord = (function () {
        // parentModelId is undefined if it's the root
    
        function ModelRecord(parentModelId, modelId, model, options) {
            _classCallCheck(this, ModelRecord);
    
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
    
        _createClass(ModelRecord, {
            parentModelId: {
                get: function () {
                    return this._parentModelId;
                }
            },
            modelId: {
                get: function () {
                    return this._modelId;
                }
            },
            model: {
                get: function () {
                    return this._model;
                }
            },
            eventQueue: {
                get: function () {
                    return this._eventQueue;
                }
            },
            hasChanges: {
                get: function () {
                    return this._hasChanges;
                },
                set: function (value) {
                    this._hasChanges = value;
                }
            },
            wasRemoved: {
                get: function () {
                    return this._wasRemoved;
                },
                set: function (value) {
                    this._wasRemoved = value;
                }
            },
            runPreEventProcessor: {
                get: function () {
                    return this._runPreEventProcessor;
                }
            },
            runPostEventProcessor: {
                get: function () {
                    return this._runPostEventProcessor;
                }
            },
            childrenIds: {
                get: function () {
                    return this._childrenIds;
                }
            },
            _createEventProcessor: {
                value: function _createEventProcessor(name, processor) {
                    if (processor) {
                        var isValid = typeof processor === "function" || typeof processor.process === "function";
                        Guard.isTrue(isValid, name + " should be a function or an object with a process() function");
                        return function (model, event, context) {
                            // I guess it's possible the shape of the processor changed since we validated it, hence the recheck, another option could be to bind the initial value and always use that.
                            if (typeof processor === "function") {
                                processor(model, event, context);
                            } else if (typeof processor.process === "function") {
                                processor.process(model, event, context);
                            } else {
                                throw new Error(name + " is neither a function or an object with a process() method");
                            }
                        };
                    }
                    return function () {};
                }
            }
        });
    
        return ModelRecord;
    })();
    
    module.exports = ModelRecord;
    /* noop processor */

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var Guard = __webpack_require__(4).Guard;
    
    var Status = _interopRequire(__webpack_require__(14));
    
    // note: perhaps some validation on state transition could be added here, but the tests cover most edges cases already
    
    var State = (function () {
        function State() {
            _classCallCheck(this, State);
    
            this._currentStatus = Status.Idle;
        }
    
        _createClass(State, {
            currentStatus: {
                get: function () {
                    return this._currentStatus;
                }
            },
            currentModelId: {
                get: function () {
                    return this._currentModelId;
                }
            },
            currentModel: {
                get: function () {
                    return this._currentModel;
                }
            },
            moveToIdle: {
                value: function moveToIdle() {
                    this._currentStatus = Status.Idle;
                    this._clear();
                }
            },
            moveToPreProcessing: {
                value: function moveToPreProcessing(modelId, model) {
                    Guard.isString(modelId, "The modelId should be a string");
                    Guard.isDefined(model, "The model should be defined");
                    this._currentModelId = modelId;
                    this._currentModel = model;
                    this._currentStatus = Status.PreEventProcessing;
                }
            },
            moveToEventDispatch: {
                value: function moveToEventDispatch() {
                    this._currentStatus = Status.EventProcessorDispatch;
                }
            },
            moveToPostProcessing: {
                value: function moveToPostProcessing() {
                    this._currentStatus = Status.PostProcessing;
                }
            },
            executeEvent: {
                value: function executeEvent(executeAction) {
                    var canMove = this._currentStatus === Status.PreEventProcessing || this._currentStatus === Status.EventProcessorDispatch || this._currentStatus === Status.PostProcessing;
                    Guard.isTrue(canMove, "Can't move to executing as the current state " + this._currentStatus + " doesn't allow it");
                    var previousStatus = this._currentStatus;
                    this._currentStatus = Status.EventExecution;
                    executeAction();
                    this._currentStatus = previousStatus;
                }
            },
            moveToDispatchModelUpdates: {
                value: function moveToDispatchModelUpdates() {
                    this._currentStatus = Status.DispatchModelUpdates;
                }
            },
            moveToHalted: {
                value: function moveToHalted() {
                    this._currentStatus = Status.Halted;
                    this._clear();
                }
            },
            _clear: {
                value: function _clear() {
                    this._currentModelId = undefined;
                    this._currentModel = undefined;
                }
            }
        });
    
        return State;
    })();
    
    module.exports = State;

/***/ },
/* 14 */
/***/ function(module, exports) {

    "use strict";
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var Status = (function () {
      function Status() {
        _classCallCheck(this, Status);
      }
    
      _createClass(Status, null, {
        Idle: {
          get: function () {
            return "idle";
          }
        },
        PreEventProcessing: {
          get: function () {
            return "preEventProcessorDispatch";
          }
        },
        EventProcessorDispatch: {
          get: function () {
            return "eventProcessorDispatch";
          }
        },
        EventExecution: {
          get: function () {
            return "eventProcessorExecution";
          }
        },
        PostProcessing: {
          get: function () {
            return "postEventProcessorDispatch";
          }
        },
        DispatchModelUpdates: {
          get: function () {
            return "dispatchModelUpdates";
          }
        },
        Halted: {
          get: function () {
            return "halted";
          }
        }
      });
    
      return Status;
    })();
    
    module.exports = Status;

/***/ },
/* 15 */
/***/ function(module, exports) {

    "use strict";
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var ModelRouter = (function () {
        function ModelRouter(underlyingRouter, targetModelId) {
            _classCallCheck(this, ModelRouter);
    
            this._underlying = underlyingRouter;
            this._targetModelId = targetModelId;
        }
    
        _createClass(ModelRouter, {
            publishEvent: {
                value: function publishEvent(eventType, event) {
                    this._underlying.publishEvent(this._targetModelId, eventType, event);
                }
            },
            executeEvent: {
                value: function executeEvent(eventType, event) {
                    this._underlying.executeEvent(eventType, event);
                }
            },
            getEventObservable: {
                value: function getEventObservable(eventType, stage) {
                    return this._underlying.getEventObservable(this._targetModelId, eventType, stage);
                }
            },
            getModelObservable: {
                value: function getModelObservable() {
                    return this._underlying.getModelObservable(this._targetModelId);
                }
            }
        });
    
        return ModelRouter;
    })();
    
    module.exports = ModelRouter;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
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
    
    // these scripts have no exports, they add functionality to Observable
    
    __webpack_require__(20);
    
    __webpack_require__(21);
    
    __webpack_require__(22);
    
    __webpack_require__(31);
    
    __webpack_require__(17);
    
    exports.Observable = _interopRequire(__webpack_require__(18));
    exports.Observer = _interopRequire(__webpack_require__(19));
    exports.Subject = _interopRequire(__webpack_require__(32));

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
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
    
    var Observable = _interopRequire(__webpack_require__(18));
    
    var Guard = __webpack_require__(4).Guard;
    
    // TODO beta, needs test
    Observable.prototype["do"] = function (action) {
        Guard.isFunction(action, "provided value isn't a function");
        var source = this;
        var observe = function (observer) {
            return source.observe(function (arg1, arg2, arg3) {
                action(arg1, arg2, arg3);
                observer.onNext(arg1, arg2, arg3);
            }, observer.onError.bind(observer), function () {
                return observer.onCompleted();
            });
        };
        return new Observable(observe, this._router);
    };

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var Guard = __webpack_require__(4).Guard;
    
    var Observer = _interopRequire(__webpack_require__(19));
    
    var Observable = (function () {
        function Observable(observe, router) {
            _classCallCheck(this, Observable);
    
            Guard.isDefined(observe, "observe Required");
            this._observe = observe;
            /*
             * note the Observable has explicit knowledge of the router to enable advanced
             * scenarios whereby links in the observable stream re-post events back into the
             * workflow, it enables the results of async operations and held event actions
             * to be posted back through the full event workflow. It does feel a little dirty
             * but it's reasonable for now. Perhaps the entire reactive objects could be wrapped
             * in a configurable module whereby each instance of the router get's it's own copy,
             * then only the explicit extensions to Observable could access the instance of
             * the router they require.
             */
            this._router = router;
        }
    
        _createClass(Observable, {
            observe: {
                value: function observe() {
                    var observer;
                    if (arguments.length === 1 && arguments[0] instanceof Observer) {
                        observer = arguments[0];
                    } else {
                        Guard.lengthIsAtLeast(arguments, 1, "Incorrect args count of " + arguments.length);
                        var onNext = arguments[0];
                        var onError = arguments.length >= 1 ? arguments[1] : undefined;
                        var onCompleted = arguments.length >= 2 ? arguments[2] : undefined;
                        observer = new Observer(onNext, onError, onCompleted);
                    }
                    return this._observe(observer);
                }
            }
        }, {
            create: {
                value: function create(onObserve, router) {
                    Guard.lengthIs(arguments, 2, "Incorrect argument count on Observable");
                    var observe = function (observer) {
                        return onObserve(observer);
                    };
                    return new Observable(observe, router);
                }
            }
        });
    
        return Observable;
    })();
    
    module.exports = Observable;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var Guard = __webpack_require__(4).Guard;
    
    var Observer = (function () {
        function Observer(onNext, onError, onCompleted) {
            _classCallCheck(this, Observer);
    
            Guard.isDefined(onNext, "onObserve Required");
            this._hasError = false;
            this._hasCompleted = false;
            this._onNext = onNext;
            this._onError = function (ex) {
                if (typeof onError === "undefined" || typeof onError !== "function") {
                    throw ex; // we default to re-throwing if there is no error handler provide
                } else {
                    onError(ex);
                }
            };
            this._onCompleted = function () {
                if (typeof onCompleted !== "undefined" && typeof onCompleted === "function") {
                    onCompleted();
                }
            };
        }
    
        _createClass(Observer, {
            onNext: {
                value: function onNext(arg1, arg2, arg3) {
                    if (!this._hasError && !this._hasCompleted) {
                        this._onNext(arg1, arg2, arg3);
                    }
                }
            },
            onError: {
                value: function onError(value) {
                    if (!this._hasError) {
                        this._hasError = true;
                        this._onError(value);
                    }
                }
            },
            onCompleted: {
                value: function onCompleted() {
                    if (!this._hasCompleted) {
                        this._hasCompleted = true;
                        this._onCompleted();
                    }
                }
            }
        });
    
        return Observer;
    })();
    
    module.exports = Observer;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
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
    
    var Observable = _interopRequire(__webpack_require__(18));
    
    var Guard = __webpack_require__(4).Guard;
    
    Observable.prototype.where = function (predicate) {
        Guard.isDefined(predicate, "predicate Required");
        var source = this;
        var observe = function (observer) {
            return source.observe(function (arg1, arg2, arg3) {
                if (predicate(arg1, arg2, arg3)) {
                    observer.onNext(arg1, arg2, arg3);
                }
            }, observer.onError.bind(observer), function () {
                return observer.onCompleted();
            });
        };
        return new Observable(observe, this._router);
    };

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
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
    
    var Observable = _interopRequire(__webpack_require__(18));
    
    Observable.prototype.asObservable = function () {
        var source = this;
        var observe = function (observer) {
            return source.observe(function (arg1, arg2, arg3) {
                observer.onNext(arg1, arg2, arg3);
            }, observer.onError.bind(observer), function () {
                return observer.onCompleted();
            });
        };
        return new Observable(observe, this._router);
    };

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
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
    
    var uuid = _interopRequire(__webpack_require__(23));
    
    var Observable = _interopRequire(__webpack_require__(18));
    
    var model = _interopRequire(__webpack_require__(24));
    
    var _system = __webpack_require__(4);
    
    var system = _interopRequire(_system);
    
    var Guard = _system.Guard;
    var utils = _system.utils;
    var logger = _system.logger;
    var disposables = _system.disposables;
    
    var CompositeDisposable = disposables.CompositeDisposable;
    var DictionaryDisposable = disposables.DictionaryDisposable;
    var AsyncWorkCompleteEvent = model.events.AsyncWorkCompleteEvent;
    
    var _asyncWorkCompleteEventName = "asyncWorkCompleteEvent";
    
    /*
    * Note: experimental, needs more test, doesn't work with .take()
    *
    * Used for asynchronous operations from event processors, this should only be used on event streams, a future revision will likely
    * enforce this or ensure the method only exists in the correct context.
    *
    * Note: this function may be removed in the future in favour of a pipeline that fully supports async interactions and is
    * more compatible with other libraries.
    * */
    Observable.prototype.beginWork = function (action) {
        var _this = this;
    
        Guard.isDefined(action, "action required, format: (ec : EventContext, done : (result : any) => { })");
        var source = this;
        var disposables = new CompositeDisposable();
        var dictionaryDisposable = new DictionaryDisposable();
        disposables.add(dictionaryDisposable);
        var observe = function (observer) {
            disposables.add(source.observe(function (model, event, eventContext) {
                var modelId = eventContext.modelId;
                var operationId = uuid.v1();
                var disposable = _this._router.getEventObservable(modelId, _asyncWorkCompleteEventName).where(function (m, e) {
                    return e.operationId === operationId;
                }).observe(function (m, e, ec) {
                    if (!disposables.isDisposed) {
                        if (e.isFinished) {
                            disposable.dispose();
                            dictionaryDisposable.remove(operationId);
                        }
                        observer.onNext(m, e, ec);
                    }
                });
                var onResultsReceived = function (result, isFinished) {
                    if (!disposables.isDisposed) {
                        isFinished = isFinished === "undefined" ? true : isFinished;
                        var asyncWorkCompleteEvent = new AsyncWorkCompleteEvent(operationId, result, isFinished);
                        // publish the async results back through the router so the full event workflow is triggered
                        source._router.publishEvent(modelId, _asyncWorkCompleteEventName, asyncWorkCompleteEvent);
                    }
                };
                dictionaryDisposable.add(operationId, disposable);
                action(model, event, eventContext, onResultsReceived);
            }, observer.onError.bind(observer), function () {
                return observer.onCompleted();
            }));
            return disposables;
        };
        return new Observable(observe, this._router);
    };

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

    var __WEBPACK_AMD_DEFINE_RESULT__;//     uuid.js
    //
    //     Copyright (c) 2010-2012 Robert Kieffer
    //     MIT License - http://opensource.org/licenses/mit-license.php
    
    (function() {
      var _global = this;
    
      // Unique ID creation requires a high quality random # generator.  We feature
      // detect to determine the best RNG source, normalizing to a function that
      // returns 128-bits of randomness, since that's what's usually required
      var _rng;
    
      // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
      //
      // Moderately fast, high quality
      if (typeof(_global.require) == 'function') {
        try {
          var _rb = _global.require('crypto').randomBytes;
          _rng = _rb && function() {return _rb(16);};
        } catch(e) {}
      }
    
      if (!_rng && _global.crypto && crypto.getRandomValues) {
        // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
        //
        // Moderately fast, high quality
        var _rnds8 = new Uint8Array(16);
        _rng = function whatwgRNG() {
          crypto.getRandomValues(_rnds8);
          return _rnds8;
        };
      }
    
      if (!_rng) {
        // Math.random()-based (RNG)
        //
        // If all else fails, use Math.random().  It's fast, but is of unspecified
        // quality.
        var  _rnds = new Array(16);
        _rng = function() {
          for (var i = 0, r; i < 16; i++) {
            if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
            _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
          }
    
          return _rnds;
        };
      }
    
      // Buffer class to use
      var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;
    
      // Maps for number <-> hex string conversion
      var _byteToHex = [];
      var _hexToByte = {};
      for (var i = 0; i < 256; i++) {
        _byteToHex[i] = (i + 0x100).toString(16).substr(1);
        _hexToByte[_byteToHex[i]] = i;
      }
    
      // **`parse()` - Parse a UUID into it's component bytes**
      function parse(s, buf, offset) {
        var i = (buf && offset) || 0, ii = 0;
    
        buf = buf || [];
        s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
          if (ii < 16) { // Don't overflow!
            buf[i + ii++] = _hexToByte[oct];
          }
        });
    
        // Zero out remaining bytes if string was short
        while (ii < 16) {
          buf[i + ii++] = 0;
        }
    
        return buf;
      }
    
      // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
      function unparse(buf, offset) {
        var i = offset || 0, bth = _byteToHex;
        return  bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]];
      }
    
      // **`v1()` - Generate time-based UUID**
      //
      // Inspired by https://github.com/LiosK/UUID.js
      // and http://docs.python.org/library/uuid.html
    
      // random #'s we need to init node and clockseq
      var _seedBytes = _rng();
    
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      var _nodeId = [
        _seedBytes[0] | 0x01,
        _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
      ];
    
      // Per 4.2.2, randomize (14 bit) clockseq
      var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;
    
      // Previous uuid creation time
      var _lastMSecs = 0, _lastNSecs = 0;
    
      // See https://github.com/broofa/node-uuid for API details
      function v1(options, buf, offset) {
        var i = buf && offset || 0;
        var b = buf || [];
    
        options = options || {};
    
        var clockseq = options.clockseq != null ? options.clockseq : _clockseq;
    
        // UUID timestamps are 100 nano-second units since the Gregorian epoch,
        // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
        // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
        // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
        var msecs = options.msecs != null ? options.msecs : new Date().getTime();
    
        // Per 4.2.1.2, use count of uuid's generated during the current clock
        // cycle to simulate higher resolution clock
        var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;
    
        // Time since last uuid creation (in msecs)
        var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;
    
        // Per 4.2.1.2, Bump clockseq on clock regression
        if (dt < 0 && options.clockseq == null) {
          clockseq = clockseq + 1 & 0x3fff;
        }
    
        // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
        // time interval
        if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
          nsecs = 0;
        }
    
        // Per 4.2.1.2 Throw error if too many uuids are requested
        if (nsecs >= 10000) {
          throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
        }
    
        _lastMSecs = msecs;
        _lastNSecs = nsecs;
        _clockseq = clockseq;
    
        // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
        msecs += 12219292800000;
    
        // `time_low`
        var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
        b[i++] = tl >>> 24 & 0xff;
        b[i++] = tl >>> 16 & 0xff;
        b[i++] = tl >>> 8 & 0xff;
        b[i++] = tl & 0xff;
    
        // `time_mid`
        var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
        b[i++] = tmh >>> 8 & 0xff;
        b[i++] = tmh & 0xff;
    
        // `time_high_and_version`
        b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
        b[i++] = tmh >>> 16 & 0xff;
    
        // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
        b[i++] = clockseq >>> 8 | 0x80;
    
        // `clock_seq_low`
        b[i++] = clockseq & 0xff;
    
        // `node`
        var node = options.node || _nodeId;
        for (var n = 0; n < 6; n++) {
          b[i + n] = node[n];
        }
    
        return buf ? buf : unparse(b);
      }
    
      // **`v4()` - Generate random UUID**
    
      // See https://github.com/broofa/node-uuid for API details
      function v4(options, buf, offset) {
        // Deprecated - 'format' argument, as supported in v1.2
        var i = buf && offset || 0;
    
        if (typeof(options) == 'string') {
          buf = options == 'binary' ? new BufferClass(16) : null;
          options = null;
        }
        options = options || {};
    
        var rnds = options.random || (options.rng || _rng)();
    
        // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
        rnds[6] = (rnds[6] & 0x0f) | 0x40;
        rnds[8] = (rnds[8] & 0x3f) | 0x80;
    
        // Copy bytes to buffer, if provided
        if (buf) {
          for (var ii = 0; ii < 16; ii++) {
            buf[i + ii] = rnds[ii];
          }
        }
    
        return buf || unparse(rnds);
      }
    
      // Export public API
      var uuid = v4;
      uuid.v1 = v1;
      uuid.v4 = v4;
      uuid.parse = parse;
      uuid.unparse = unparse;
      uuid.BufferClass = BufferClass;
    
      if (typeof(module) != 'undefined' && module.exports) {
        // Publish as node.js module
        module.exports = uuid;
      } else  if (true) {
        // Publish as AMD module
        !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {return uuid;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
     
    
      } else {
        // Publish as global (in browsers)
        var _previousRoot = _global.uuid;
    
        // **`noConflict()` - (browser only) to reset global 'uuid' var**
        uuid.noConflict = function() {
          _global.uuid = _previousRoot;
          return uuid;
        };
    
        _global.uuid = uuid;
      }
    }).call(this);


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
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
    
    var events = _interopRequire(__webpack_require__(25));
    
    var DisposableBase = _interopRequire(__webpack_require__(28));
    
    var ModelBase = _interopRequire(__webpack_require__(29));
    
    var ModelRootBase = _interopRequire(__webpack_require__(30));
    
    module.exports = { events: events, DisposableBase: DisposableBase, ModelBase: ModelBase, ModelRootBase: ModelRootBase };

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
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
    
    var AsyncWorkCompleteEvent = _interopRequire(__webpack_require__(26));
    
    var SubModelChangedEvent = _interopRequire(__webpack_require__(27));
    
    module.exports = { AsyncWorkCompleteEvent: AsyncWorkCompleteEvent, SubModelChangedEvent: SubModelChangedEvent };

/***/ },
/* 26 */
/***/ function(module, exports) {

    "use strict";
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var AsyncWorkCompleteEvent = (function () {
        function AsyncWorkCompleteEvent(operationId, results, isFinished) {
            _classCallCheck(this, AsyncWorkCompleteEvent);
    
            this._operationId = operationId;
            this._results = results;
            this._isFinished = isFinished;
        }
    
        _createClass(AsyncWorkCompleteEvent, {
            operationId: {
                get: function () {
                    return this._operationId;
                }
            },
            results: {
                get: function () {
                    return this._results;
                }
            },
            isFinished: {
                get: function () {
                    return this._isFinished;
                }
            }
        });
    
        return AsyncWorkCompleteEvent;
    })();
    
    module.exports = AsyncWorkCompleteEvent;

/***/ },
/* 27 */
/***/ function(module, exports) {

    "use strict";
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var SubModelChangedEvent = (function () {
        function SubModelChangedEvent(childModelId, eventType) {
            _classCallCheck(this, SubModelChangedEvent);
    
            this._childModelId = childModelId;
            this._eventType = eventType;
        }
    
        _createClass(SubModelChangedEvent, {
            childModelId: {
                get: function () {
                    return this._childModelId;
                }
            },
            eventType: {
                get: function () {
                    return this._eventType;
                }
            }
        });
    
        return SubModelChangedEvent;
    })();
    
    module.exports = SubModelChangedEvent;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var system = _interopRequire(__webpack_require__(4));
    
    var DisposableBase = (function () {
        function DisposableBase() {
            _classCallCheck(this, DisposableBase);
    
            this._disposables = new system.disposables.CompositeDisposable();
        }
    
        _createClass(DisposableBase, {
            isDisposed: {
                get: function () {
                    return this._disposables.isDisposed;
                }
            },
            addDisposable: {
                value: function addDisposable(disposable) {
                    this._disposables.add(disposable);
                }
            },
            dispose: {
                value: function dispose() {
                    this._disposables.dispose();
                }
            }
        });
    
        return DisposableBase;
    })();
    
    module.exports = DisposableBase;

/***/ },
/* 29 */
/***/ function(module, exports) {

    "use strict";
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    /**
     * A base class for model entities.
     *
     * You don't need to derive from this to use the router, provided as a convenience
     */
    
    var ModelBase = (function () {
        function ModelBase() {
            _classCallCheck(this, ModelBase);
    
            this._checkIsLocked = function () {
                return true;
            };
        }
    
        _createClass(ModelBase, {
            ensureLocked: {
                value: function ensureLocked() {
                    if (this._checkIsLocked()) {
                        throw new Error("Model is locked, can't edit");
                    }
                }
            },
            isLocked: {
                get: function () {
                    return this._checkIsLocked();
                }
            }
        });
    
        return ModelBase;
    })();
    
    module.exports = ModelBase;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
    
    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var ModelBase = _interopRequire(__webpack_require__(29));
    
    /**
     * A base class for the root model entity.
     *
     * You don't need to derive from this to use the router, provided as a convenience
     */
    
    var ModelRootBase = (function (_ModelBase) {
        function ModelRootBase() {
            _classCallCheck(this, ModelRootBase);
    
            _get(Object.getPrototypeOf(ModelRootBase.prototype), "constructor", this).call(this);
            this._isLocked = true;
            this._checkIsLocked = (function () {
                return this._isLocked;
            }).bind(this);
        }
    
        _inherits(ModelRootBase, _ModelBase);
    
        _createClass(ModelRootBase, {
            lock: {
                value: function lock() {
                    this._isLocked = true;
                }
            },
            unlock: {
                value: function unlock() {
                    this._isLocked = false;
                }
            },
            bindLockPredicate: {
                value: function bindLockPredicate() {
                    this._bindLockPredicate(this);
                }
            },
            _bindLockPredicate: {
                value: function _bindLockPredicate(parent) {
                    parent = parent || this;
                    for (var key in parent) {
                        if (parent.hasOwnProperty(key)) {
                            var o = parent[key];
                            if (o instanceof ModelBase) {
                                o._checkIsLocked = this._checkIsLocked;
                                this._bindLockPredicate(o);
                            }
                        }
                    }
                }
            }
        });
    
        return ModelRootBase;
    })(ModelBase);
    
    module.exports = ModelRootBase;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
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
    
    var Observable = _interopRequire(__webpack_require__(18));
    
    var Guard = __webpack_require__(4).Guard;
    
    // TODO beta, needs test
    Observable.prototype.take = function (number) {
        Guard.isNumber(number, "provided value isn't a number");
        var source = this;
        var itemsReceived = 0;
        var hasCompleted = false;
        var observe = function (observer) {
            return source.observe(function (arg1, arg2, arg3) {
                // there is possibly some strange edge cases if the observer also pumps a new value, this 'should' cover that (no tests yet)
                itemsReceived++;
                var shouldYield = !number || itemsReceived <= number;
                if (shouldYield) {
                    observer.onNext(arg1, arg2, arg3);
                }
                var shouldComplete = !number || itemsReceived >= number;
                if (!hasCompleted && shouldComplete) {
                    hasCompleted = true;
                    observer.onCompleted();
                }
            }, observer.onError.bind(observer), function () {
                return observer.onCompleted();
            });
        };
        return new Observable(observe, this._router);
    };

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
    
    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
    
    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
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
    
    var utils = __webpack_require__(4).utils;
    
    var Observable = _interopRequire(__webpack_require__(18));
    
    var Subject = (function (_Observable) {
        function Subject(router) {
            _classCallCheck(this, Subject);
    
            _get(Object.getPrototypeOf(Subject.prototype), "constructor", this).call(this, observe.bind(this), router);
            this._observers = [];
            this._hasComplete = false;
            this._hasError = false;
        }
    
        _inherits(Subject, _Observable);
    
        _createClass(Subject, {
            hasError: {
                get: function () {
                    return this._hasError;
                }
            },
            error: {
                get: function () {
                    return this._error;
                }
            },
            onNext: {
                // The reactivate implementation can push 3 arguments through the stream, initially this was setup to
                // pass all arguments using .apply, however it's performance is about 40% slower than direct method calls
                // given this, and that we only ever push a max of 3 args, it makes sense to hard code them.
    
                value: function onNext(arg1, arg2, arg3) {
                    if (!this._hasComplete) {
                        var os = this._observers.slice(0);
                        for (var i = 0, len = os.length; i < len; i++) {
                            if (this._hasError) break;
                            var observer = os[i];
                            try {
                                observer.onNext(arg1, arg2, arg3);
                            } catch (err) {
                                this._hasError = true;
                                this._error = err;
                                observer.onError(err);
                            }
                        }
                    }
                }
            },
            onCompleted: {
                value: function onCompleted() {
                    if (!this._hasComplete && !this._hasError) {
                        this._hasComplete = true;
                        var os = this._observers.slice(0);
                        for (var i = 0, len = os.length; i < len; i++) {
                            var observer = os[i];
                            observer.onCompleted();
                        }
                    }
                }
            },
            onError: {
                value: function onError(err) {
                    if (!this._hasError) {
                        this._hasError = true;
                        var os = this._observers.slice(0);
                        for (var i = 0, len = os.length; i < len; i++) {
                            var observer = os[i];
                            observer.onError(err);
                        }
                    }
                }
            },
            getObserverCount: {
                value: function getObserverCount() {
                    return this._observers.length;
                }
            }
        });
    
        return Subject;
    })(Observable);
    
    function observe(observer) {
        var _this = this;
    
        /*jshint validthis:true */
        this._observers.push(observer);
        return {
            dispose: function () {
                utils.removeAll(_this._observers, observer);
            }
        };
    }
    module.exports = Subject;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=esp.js.map