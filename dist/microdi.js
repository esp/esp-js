(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["microdi"] = factory();
	else
		root["microdi"] = factory();
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

    'use strict';
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    
    var _Container = __webpack_require__(1);
    
    var _Container2 = _interopRequireDefault(_Container);
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    
    exports.default = { Container: _Container2.default }; /* notice_start
                                                           * Copyright 2016 Dev Shop Limited
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
                                                           notice_end */

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

    'use strict';
    
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    
    var _create = __webpack_require__(2);
    
    var _create2 = _interopRequireDefault(_create);
    
    var _classCallCheck2 = __webpack_require__(5);
    
    var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
    
    var _createClass2 = __webpack_require__(6);
    
    var _createClass3 = _interopRequireDefault(_createClass2);
    
    var _utils = __webpack_require__(9);
    
    var utils = _interopRequireWildcard(_utils);
    
    var _ResolverContext = __webpack_require__(10);
    
    var _ResolverContext2 = _interopRequireDefault(_ResolverContext);
    
    var _InstanceLifecycleType = __webpack_require__(11);
    
    var _InstanceLifecycleType2 = _interopRequireDefault(_InstanceLifecycleType);
    
    var _RegistrationModifier = __webpack_require__(12);
    
    var _RegistrationModifier2 = _interopRequireDefault(_RegistrationModifier);
    
    var _Guard = __webpack_require__(13);
    
    var _Guard2 = _interopRequireDefault(_Guard);
    
    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    
    var Container = function () {
        function Container() {
            (0, _classCallCheck3.default)(this, Container);
    
            this._isChildContainer = false;
            this._parent = undefined;
            this._registrations = {};
            this._registrationGroups = {};
            this._instanceCache = {};
            this._resolverContext = new _ResolverContext2.default();
            this._resolvers = this._createDefaultResolvers();
            this._isDisposed = false;
            this._childContainers = [];
        }
    
        (0, _createClass3.default)(Container, [{
            key: 'createChildContainer',
            value: function createChildContainer() {
                this._throwIfDisposed();
                // The child prototypically inherits some but not all props from its parent.
                // Below we override the ones it doesn't inherit.
                var child = (0, _create2.default)(this);
                child._parent = this;
                child._isChildContainer = true;
                child._registrations = (0, _create2.default)(this._registrations);
                child._registrationGroups = (0, _create2.default)(this._registrationGroups);
                child._instanceCache = (0, _create2.default)(this._instanceCache);
                child._resolvers = (0, _create2.default)(this._resolvers);
                child._isDisposed = false;
                child._childContainers = [];
                this._childContainers.push(child);
                return child;
            }
        }, {
            key: 'register',
            value: function register(name, proto) {
                _Guard2.default.isString(name, 'name must be a string');
                _Guard2.default.isTrue(!utils.isString(proto), 'Can not register a string using register(). Use registerInstance()');
                _Guard2.default.isTrue(!utils.isNumber(proto), 'Can not register a number using register(). Use registerInstance()');
                this._throwIfDisposed();
                var registration = {
                    name: name,
                    proto: proto,
                    dependencyList: [],
                    instanceLifecycleType: _InstanceLifecycleType2.default.singleton
                };
                this._registrations[name] = registration;
                return new _RegistrationModifier2.default(registration, this._instanceCache, this._registrationGroups);
            }
        }, {
            key: 'registerInstance',
            value: function registerInstance(name, instance) {
                var isExternallyOwned = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
    
                this._throwIfDisposed();
                this._registrations[name] = {
                    name: name,
                    instanceLifecycleType: isExternallyOwned ? _InstanceLifecycleType2.default.external : _InstanceLifecycleType2.default.singleton
                };
                this._instanceCache[name] = instance;
            }
        }, {
            key: 'resolve',
            value: function resolve(name) {
                this._throwIfDisposed();
                var registration = this._registrations[name],
                    dependency,
                    instance,
                    error;
                if (!registration) {
                    error = utils.sprintf('Nothing registered for dependency [%s]', name);
                    throw new Error(error);
                }
                instance = this._tryRetrieveFromCache(name);
    
                for (var _len = arguments.length, additionalDependencies = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    additionalDependencies[_key - 1] = arguments[_key];
                }
    
                if (!instance) {
                    instance = this._buildInstance(name, additionalDependencies);
                    if (registration.instanceLifecycleType === _InstanceLifecycleType2.default.singleton || registration.instanceLifecycleType === _InstanceLifecycleType2.default.singletonPerContainer) {
                        this._instanceCache[name] = instance;
                    }
                } else if (additionalDependencies.length > 0) {
                    throw new Error("The provided additional dependencies can't be used to construct the instance as an existing instance was found in the container");
                }
                return instance;
            }
        }, {
            key: 'resolveGroup',
            value: function resolveGroup(groupName) {
                this._throwIfDisposed();
                var items = [],
                    mapings,
                    error;
                mapings = this._registrationGroups[groupName];
                if (!mapings) {
                    error = utils.sprintf('No group with name [%s] registered', groupName);
                    throw new Error(error);
                }
                for (var i = 0, len = mapings.length; i < len; i++) {
                    items.push(this.resolve(mapings[i]));
                }
                return items;
            }
        }, {
            key: 'addResolver',
            value: function addResolver(name, resolver) {
                this._throwIfDisposed();
                this._resolvers[name] = resolver;
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                this._disposeContainer();
            }
        }, {
            key: '_tryRetrieveFromCache',
            value: function _tryRetrieveFromCache(name) {
                var registration = this._registrations[name],
                    instance = this._instanceCache[name],
                    thisContainerOwnsRegistration,
                    thisContainerOwnsInstance,
                    typeIsSingleton,
                    childHasOverriddenRegistration,
                    parentRegistrationIsSingletonPerContainer;
                if (this._isChildContainer) {
                    thisContainerOwnsRegistration = this._registrations.hasOwnProperty(name);
                    if (instance === undefined) {
                        typeIsSingleton = registration.instanceLifecycleType === _InstanceLifecycleType2.default.singleton;
                        // do we have the right to create it, or do we need to defer to the parent?
                        if (!thisContainerOwnsRegistration && typeIsSingleton) {
                            // singletons always need to be resolved and stored with the container that owns the
                            // registration, otherwise the cached instance won't live in the right place
                            instance = this._parent.resolve(name);
                        }
                    } else {
                        thisContainerOwnsInstance = this._instanceCache.hasOwnProperty(name);
                        if (!thisContainerOwnsInstance) {
                            childHasOverriddenRegistration = thisContainerOwnsRegistration && !thisContainerOwnsInstance;
                            parentRegistrationIsSingletonPerContainer = !thisContainerOwnsRegistration && registration.instanceLifecycleType === _InstanceLifecycleType2.default.singletonPerContainer;
                            if (childHasOverriddenRegistration || parentRegistrationIsSingletonPerContainer) {
                                instance = undefined;
                            }
                        }
                    }
                }
                return instance;
            }
        }, {
            key: '_buildInstance',
            value: function _buildInstance(name, additionalDependencies) {
                var registration = this._registrations[name],
                    dependencies = [],
                    dependency,
                    dependencyKey,
                    context,
                    instance,
                    resolver;
                context = this._resolverContext.beginResolve(name);
                try {
                    if (registration.dependencyList !== undefined) {
                        for (var i = 0, len = registration.dependencyList.length; i < len; i++) {
                            dependencyKey = registration.dependencyList[i];
                            if (utils.isString(dependencyKey)) {
                                dependency = this.resolve(dependencyKey);
                            } else if (dependencyKey.hasOwnProperty('resolver') && utils.isString(dependencyKey.resolver)) {
                                resolver = this._resolvers[dependencyKey.resolver];
                                if (resolver === undefined) {
                                    throw new Error(utils.sprintf('Error resolving [%s]. No resolver registered to resolve dependency key for resolver [%s]', name, dependencyKey.resolver));
                                }
                                dependency = resolver.resolve(this, dependencyKey);
                            } else {
                                throw new Error(utils.sprintf('Error resolving [%s]. It\'s dependency at index [%s] had an unknown resolver', name, i));
                            }
                            dependencies.push(dependency);
                        }
                    }
                    for (var j = 0, _len2 = additionalDependencies.length; j < _len2; j++) {
                        dependencies.push(additionalDependencies[j]);
                    }
                    if (registration.proto.isResolverKey) {
                        if (registration.proto.resolver) {
                            resolver = this._resolvers[registration.proto.resolver];
                            instance = resolver.resolve(this, registration.proto);
                        } else {
                            throw new Error('Registered resolverKey is missing it\'s resolver property');
                        }
                    } else if (typeof registration.proto === 'function') {
                        var Ctor = registration.proto.bind.apply(registration.proto, [null].concat(dependencies));
                        instance = new Ctor();
                    } else {
                        instance = (0, _create2.default)(registration.proto);
                        if (instance.init !== undefined) {
                            instance = instance.init.apply(instance, dependencies) || instance;
                        }
                    }
                } finally {
                    context.endResolve();
                }
                return instance;
            }
        }, {
            key: '_createDefaultResolvers',
            value: function _createDefaultResolvers() {
                return {
                    // A resolvers that delegates to the dependency keys resolve method to perform the resolution.
                    // It expects a dependency key in format:
                    // { resolver: 'factory', resolve: function(container) { return someInstance } }
                    delegate: {
                        resolve: function resolve(container, dependencyKey) {
                            return dependencyKey.resolve(container);
                        }
                    },
                    // A resolvers that returns a factory that when called will resolve the dependency from the container.
                    // Any arguments passed at runtime will be passed to resolve as additional dependencies
                    // It expects a dependency key in format:
                    // { resolver: 'factory', name: "aDependencyName" }
                    factory: {
                        resolve: function resolve(container, dependencyKey) {
                            return function () {
                                // using function here as I don't want babel to re-write the arguments var
                                var args = [].slice.call(arguments);
                                args.unshift(dependencyKey.key);
                                return container.resolve.apply(container, args);
                            };
                        }
                    }
                };
            }
        }, {
            key: '_throwIfDisposed',
            value: function _throwIfDisposed() {
                if (this._isDisposed) throw new Error("Container has been disposed");
            }
        }, {
            key: '_disposeContainer',
            value: function _disposeContainer() {
                if (!this._isDisposed) {
                    this._isDisposed = true;
                    for (var prop in this._instanceCache) {
                        if (this._instanceCache.hasOwnProperty(prop)) {
                            var registration = this._registrations[prop];
                            if (registration.instanceLifecycleType !== _InstanceLifecycleType2.default.external) {
                                var instance = this._instanceCache[prop];
                                if (instance.dispose) {
                                    instance.dispose();
                                }
                            }
                        }
                    }
                    for (var i = 0, len = this._childContainers.length; i < len; i++) {
                        var child = this._childContainers[i];
                        child._disposeContainer();
                    }
                }
            }
        }]);
        return Container;
    }(); /* notice_start
          * Copyright 2016 Dev Shop Limited
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
          notice_end */
    
    exports.default = Container;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

    module.exports = { "default": __webpack_require__(3), __esModule: true };

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

    var $ = __webpack_require__(4);
    module.exports = function create(P, D){
      return $.create(P, D);
    };

/***/ },
/* 4 */
/***/ function(module, exports) {

    var $Object = Object;
    module.exports = {
      create:     $Object.create,
      getProto:   $Object.getPrototypeOf,
      isEnum:     {}.propertyIsEnumerable,
      getDesc:    $Object.getOwnPropertyDescriptor,
      setDesc:    $Object.defineProperty,
      setDescs:   $Object.defineProperties,
      getKeys:    $Object.keys,
      getNames:   $Object.getOwnPropertyNames,
      getSymbols: $Object.getOwnPropertySymbols,
      each:       [].forEach
    };

/***/ },
/* 5 */
/***/ function(module, exports) {

    "use strict";
    
    exports.__esModule = true;
    
    exports.default = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    exports.__esModule = true;
    
    var _defineProperty = __webpack_require__(7);
    
    var _defineProperty2 = _interopRequireDefault(_defineProperty);
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    
    exports.default = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          (0, _defineProperty2.default)(target, descriptor.key, descriptor);
        }
      }
    
      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

    module.exports = { "default": __webpack_require__(8), __esModule: true };

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

    var $ = __webpack_require__(4);
    module.exports = function defineProperty(it, key, desc){
      return $.setDesc(it, key, desc);
    };

/***/ },
/* 9 */
/***/ function(module, exports) {

    'use strict';
    
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.sprintf = sprintf;
    exports.isString = isString;
    exports.isNumber = isNumber;
    exports.indexOf = indexOf;
    /* notice_start
     * Copyright 2016 Dev Shop Limited
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
     notice_end */
    
    function sprintf(format, etc) {
        var arg = arguments;
        var i = 1;
        return format.replace(/%((%)|s)/g, function (m) {
            return m[2] || arg[i++];
        });
    }
    
    function isString(value) {
        return Object.prototype.toString.call(value) === '[object String]';
    }
    
    function isNumber(value) {
        return Object.prototype.toString.call(value) === '[object Number]';
    }
    
    function indexOf(array, item) {
        var iOf;
        if (typeof Array.prototype.indexOf === 'function') {
            iOf = Array.prototype.indexOf;
        } else {
            iOf = function iOf(item) {
                var i = -1,
                    index = -1;
    
                for (i = 0; i < this.length; i++) {
                    if (this[i] === item) {
                        index = i;
                        break;
                    }
                }
    
                return index;
            };
        }
    
        var index = iOf.call(array, item);
        return index;
    }

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

    'use strict';
    
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    
    var _classCallCheck2 = __webpack_require__(5);
    
    var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
    
    var _createClass2 = __webpack_require__(6);
    
    var _createClass3 = _interopRequireDefault(_createClass2);
    
    var _utils = __webpack_require__(9);
    
    var utils = _interopRequireWildcard(_utils);
    
    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    
    // helper to track circular dependencies during a resolve call
    
    var ResolverContext = function () {
        function ResolverContext() {
            (0, _classCallCheck3.default)(this, ResolverContext);
    
            this._isResolving = false;
            this._resolutionChain = [];
            this._hasEnded = false;
        }
    
        (0, _createClass3.default)(ResolverContext, [{
            key: 'beginResolve',
            value: function beginResolve(key) {
                var self = this;
                if (self._resolutionChain.indexOf(key) !== -1) {
                    var resolutionChainSummary = self._resolutionChain[0];
                    for (var i = 1; i < self._resolutionChain.length; i++) {
                        resolutionChainSummary += ' -required-> ' + self._resolutionChain[i];
                    }
                    resolutionChainSummary += ' -required-> ' + key;
                    throw new Error(utils.sprintf('Circular dependency detected when resolving item by name \'%s\'.\r\nThe resolution chain was:\r\n%s', key, resolutionChainSummary));
                }
                if (!this._isResolving) {
                    this._isResolving = true;
                }
                self._resolutionChain.push(key);
                return {
                    endResolve: function endResolve() {
                        if (!this._hasEnded) {
                            this._hasEnded = true;
                            var i = self._resolutionChain.indexOf(key);
                            if (i > -1) {
                                self._resolutionChain.splice(i, 1);
                            }
                            if (self._resolutionChain.length === 0) {
                                self._isResolving = false;
                            }
                        }
                    }
                };
            }
        }]);
        return ResolverContext;
    }(); /* notice_start
          * Copyright 2016 Dev Shop Limited
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
          notice_end */
    
    exports.default = ResolverContext;

/***/ },
/* 11 */
/***/ function(module, exports) {

    'use strict';
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    /* notice_start
     * Copyright 2016 Dev Shop Limited
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
     notice_end */
    
    exports.default = {
      transient: 'transient',
      singleton: 'singleton',
      singletonPerContainer: 'singletonPerContainer',
      external: 'external'
    };

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

    'use strict';
    
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    
    var _classCallCheck2 = __webpack_require__(5);
    
    var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
    
    var _createClass2 = __webpack_require__(6);
    
    var _createClass3 = _interopRequireDefault(_createClass2);
    
    var _utils = __webpack_require__(9);
    
    var utils = _interopRequireWildcard(_utils);
    
    var _InstanceLifecycleType = __webpack_require__(11);
    
    var _InstanceLifecycleType2 = _interopRequireDefault(_InstanceLifecycleType);
    
    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    
    /* notice_start
     * Copyright 2016 Dev Shop Limited
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
     notice_end */
    
    var RegistrationModifier = function () {
        function RegistrationModifier(registration, instanceCache, registrationGroups) {
            (0, _classCallCheck3.default)(this, RegistrationModifier);
    
            this._registration = registration;
            this._instanceCache = instanceCache;
            this._registrationGroups = registrationGroups;
            this.singleton();
        }
    
        (0, _createClass3.default)(RegistrationModifier, [{
            key: 'inject',
            value: function inject() {
                this._ensureInstanceNotCreated();
                var dependencyList = Array.prototype.slice.call(arguments);
                this._validateDependencyList(dependencyList);
                this._registration.dependencyList = dependencyList;
                return this;
            }
        }, {
            key: 'transient',
            value: function transient() {
                this._ensureInstanceNotCreated();
                this._registration.instanceLifecycleType = _InstanceLifecycleType2.default.transient;
                return this;
            }
        }, {
            key: 'singleton',
            value: function singleton() {
                this._ensureInstanceNotCreated();
                this._registration.instanceLifecycleType = _InstanceLifecycleType2.default.singleton;
                return this;
            }
        }, {
            key: 'singletonPerContainer',
            value: function singletonPerContainer() {
                this._ensureInstanceNotCreated();
                this._registration.instanceLifecycleType = _InstanceLifecycleType2.default.singletonPerContainer;
                return this;
            }
        }, {
            key: 'inGroup',
            value: function inGroup(groupName) {
                this._ensureInstanceNotCreated();
                var currentContainerOwnsRegistration = true;
                var lookup = this._registrationGroups[groupName];
                if (lookup) {
                    // Groups are resolved against the container they are registered against.
                    // Child containers will inherit the group unless the child overwrites the registration.
                    currentContainerOwnsRegistration = this._registrationGroups.hasOwnProperty(groupName);
                }
                if (lookup === undefined || !currentContainerOwnsRegistration) {
                    lookup = [];
                    this._registrationGroups[groupName] = lookup;
                }
                if (utils.indexOf(lookup, this._registration.name) !== -1) {
                    throw new Error(utils.sprintf('Instance already created for key [%s]', this._registration.name));
                }
                lookup.push(this._registration.name);
                return this;
            }
        }, {
            key: '_ensureInstanceNotCreated',
            value: function _ensureInstanceNotCreated() {
                if (this._registration.hasOwnProperty(this._registration.name) && this._instanceCache.hasOwnProperty(this._registration.name)) throw new Error(utils.sprintf('Instance already created for key [%s]', this._registration.name));
            }
        }, {
            key: '_validateDependencyList',
            value: function _validateDependencyList(dependencyList) {
                // TODO
            }
        }]);
        return RegistrationModifier;
    }();
    
    exports.default = RegistrationModifier;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

    'use strict';
    
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    
    var _typeof2 = __webpack_require__(14);
    
    var _typeof3 = _interopRequireDefault(_typeof2);
    
    var _classCallCheck2 = __webpack_require__(5);
    
    var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
    
    var _createClass2 = __webpack_require__(6);
    
    var _createClass3 = _interopRequireDefault(_createClass2);
    
    var _utils = __webpack_require__(9);
    
    var utils = _interopRequireWildcard(_utils);
    
    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    
    var Guard = function () {
        function Guard() {
            (0, _classCallCheck3.default)(this, Guard);
        }
    
        (0, _createClass3.default)(Guard, null, [{
            key: 'isDefined',
            value: function isDefined(value, message) {
                if (typeof value === 'undefined') {
                    doThrow(message);
                }
            }
        }, {
            key: 'isFalsey',
            value: function isFalsey(value, message) {
                if (value) {
                    doThrow(message);
                }
            }
        }, {
            key: 'lengthIs',
            value: function lengthIs(array, length, message) {
                if (array.length !== length) {
                    doThrow(message);
                }
            }
        }, {
            key: 'lengthGreaterThan',
            value: function lengthGreaterThan(array, expected, message) {
                if (array.length < expected) {
                    doThrow(message);
                }
            }
        }, {
            key: 'lengthIsAtLeast',
            value: function lengthIsAtLeast(array, expected, message) {
                if (array.length < expected) {
                    doThrow(message);
                }
            }
        }, {
            key: 'isString',
            value: function isString(value, message) {
                if (!utils.isString(value)) {
                    doThrow(message);
                }
            }
        }, {
            key: 'isNumber',
            value: function isNumber(value, message) {
                if (!utils.isNumber(value)) {
                    doThrow(message);
                }
            }
        }, {
            key: 'isTrue',
            value: function isTrue(check, message) {
                if (!check) {
                    doThrow(message);
                }
            }
        }, {
            key: 'isFunction',
            value: function isFunction(item, message) {
                if (typeof item != "function") {
                    doThrow(message);
                }
            }
        }, {
            key: 'isObject',
            value: function isObject(value, message) {
                if ((typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) !== 'object') {
                    doThrow(message);
                }
            }
        }]);
        return Guard;
    }(); /* notice_start
          * Copyright 2016 Dev Shop Limited
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
          notice_end */
    
    exports.default = Guard;
    
    
    function doThrow(message) {
        if (typeof message === 'undefined' || message === '') {
            throw new Error("Argument error");
        }
        throw new Error(message);
    }

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

    "use strict";
    
    var _Symbol = __webpack_require__(15)["default"];
    
    exports["default"] = function (obj) {
      return obj && obj.constructor === _Symbol ? "symbol" : typeof obj;
    };
    
    exports.__esModule = true;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

    module.exports = { "default": __webpack_require__(16), __esModule: true };

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

    __webpack_require__(17);
    __webpack_require__(44);
    module.exports = __webpack_require__(23).Symbol;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

    'use strict';
    // ECMAScript 6 symbols shim
    var $              = __webpack_require__(4)
      , global         = __webpack_require__(18)
      , has            = __webpack_require__(19)
      , DESCRIPTORS    = __webpack_require__(20)
      , $export        = __webpack_require__(22)
      , redefine       = __webpack_require__(26)
      , $fails         = __webpack_require__(21)
      , shared         = __webpack_require__(29)
      , setToStringTag = __webpack_require__(30)
      , uid            = __webpack_require__(32)
      , wks            = __webpack_require__(31)
      , keyOf          = __webpack_require__(33)
      , $names         = __webpack_require__(38)
      , enumKeys       = __webpack_require__(39)
      , isArray        = __webpack_require__(40)
      , anObject       = __webpack_require__(41)
      , toIObject      = __webpack_require__(34)
      , createDesc     = __webpack_require__(28)
      , getDesc        = $.getDesc
      , setDesc        = $.setDesc
      , _create        = $.create
      , getNames       = $names.get
      , $Symbol        = global.Symbol
      , $JSON          = global.JSON
      , _stringify     = $JSON && $JSON.stringify
      , setter         = false
      , HIDDEN         = wks('_hidden')
      , isEnum         = $.isEnum
      , SymbolRegistry = shared('symbol-registry')
      , AllSymbols     = shared('symbols')
      , useNative      = typeof $Symbol == 'function'
      , ObjectProto    = Object.prototype;
    
    // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
    var setSymbolDesc = DESCRIPTORS && $fails(function(){
      return _create(setDesc({}, 'a', {
        get: function(){ return setDesc(this, 'a', {value: 7}).a; }
      })).a != 7;
    }) ? function(it, key, D){
      var protoDesc = getDesc(ObjectProto, key);
      if(protoDesc)delete ObjectProto[key];
      setDesc(it, key, D);
      if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
    } : setDesc;
    
    var wrap = function(tag){
      var sym = AllSymbols[tag] = _create($Symbol.prototype);
      sym._k = tag;
      DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
        configurable: true,
        set: function(value){
          if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
          setSymbolDesc(this, tag, createDesc(1, value));
        }
      });
      return sym;
    };
    
    var isSymbol = function(it){
      return typeof it == 'symbol';
    };
    
    var $defineProperty = function defineProperty(it, key, D){
      if(D && has(AllSymbols, key)){
        if(!D.enumerable){
          if(!has(it, HIDDEN))setDesc(it, HIDDEN, createDesc(1, {}));
          it[HIDDEN][key] = true;
        } else {
          if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
          D = _create(D, {enumerable: createDesc(0, false)});
        } return setSymbolDesc(it, key, D);
      } return setDesc(it, key, D);
    };
    var $defineProperties = function defineProperties(it, P){
      anObject(it);
      var keys = enumKeys(P = toIObject(P))
        , i    = 0
        , l = keys.length
        , key;
      while(l > i)$defineProperty(it, key = keys[i++], P[key]);
      return it;
    };
    var $create = function create(it, P){
      return P === undefined ? _create(it) : $defineProperties(_create(it), P);
    };
    var $propertyIsEnumerable = function propertyIsEnumerable(key){
      var E = isEnum.call(this, key);
      return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
        ? E : true;
    };
    var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
      var D = getDesc(it = toIObject(it), key);
      if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
      return D;
    };
    var $getOwnPropertyNames = function getOwnPropertyNames(it){
      var names  = getNames(toIObject(it))
        , result = []
        , i      = 0
        , key;
      while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
      return result;
    };
    var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
      var names  = getNames(toIObject(it))
        , result = []
        , i      = 0
        , key;
      while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
      return result;
    };
    var $stringify = function stringify(it){
      if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
      var args = [it]
        , i    = 1
        , $$   = arguments
        , replacer, $replacer;
      while($$.length > i)args.push($$[i++]);
      replacer = args[1];
      if(typeof replacer == 'function')$replacer = replacer;
      if($replacer || !isArray(replacer))replacer = function(key, value){
        if($replacer)value = $replacer.call(this, key, value);
        if(!isSymbol(value))return value;
      };
      args[1] = replacer;
      return _stringify.apply($JSON, args);
    };
    var buggyJSON = $fails(function(){
      var S = $Symbol();
      // MS Edge converts symbol values to JSON as {}
      // WebKit converts symbol values to JSON as null
      // V8 throws on boxed symbols
      return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
    });
    
    // 19.4.1.1 Symbol([description])
    if(!useNative){
      $Symbol = function Symbol(){
        if(isSymbol(this))throw TypeError('Symbol is not a constructor');
        return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
      };
      redefine($Symbol.prototype, 'toString', function toString(){
        return this._k;
      });
    
      isSymbol = function(it){
        return it instanceof $Symbol;
      };
    
      $.create     = $create;
      $.isEnum     = $propertyIsEnumerable;
      $.getDesc    = $getOwnPropertyDescriptor;
      $.setDesc    = $defineProperty;
      $.setDescs   = $defineProperties;
      $.getNames   = $names.get = $getOwnPropertyNames;
      $.getSymbols = $getOwnPropertySymbols;
    
      if(DESCRIPTORS && !__webpack_require__(43)){
        redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
      }
    }
    
    var symbolStatics = {
      // 19.4.2.1 Symbol.for(key)
      'for': function(key){
        return has(SymbolRegistry, key += '')
          ? SymbolRegistry[key]
          : SymbolRegistry[key] = $Symbol(key);
      },
      // 19.4.2.5 Symbol.keyFor(sym)
      keyFor: function keyFor(key){
        return keyOf(SymbolRegistry, key);
      },
      useSetter: function(){ setter = true; },
      useSimple: function(){ setter = false; }
    };
    // 19.4.2.2 Symbol.hasInstance
    // 19.4.2.3 Symbol.isConcatSpreadable
    // 19.4.2.4 Symbol.iterator
    // 19.4.2.6 Symbol.match
    // 19.4.2.8 Symbol.replace
    // 19.4.2.9 Symbol.search
    // 19.4.2.10 Symbol.species
    // 19.4.2.11 Symbol.split
    // 19.4.2.12 Symbol.toPrimitive
    // 19.4.2.13 Symbol.toStringTag
    // 19.4.2.14 Symbol.unscopables
    $.each.call((
      'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
      'species,split,toPrimitive,toStringTag,unscopables'
    ).split(','), function(it){
      var sym = wks(it);
      symbolStatics[it] = useNative ? sym : wrap(sym);
    });
    
    setter = true;
    
    $export($export.G + $export.W, {Symbol: $Symbol});
    
    $export($export.S, 'Symbol', symbolStatics);
    
    $export($export.S + $export.F * !useNative, 'Object', {
      // 19.1.2.2 Object.create(O [, Properties])
      create: $create,
      // 19.1.2.4 Object.defineProperty(O, P, Attributes)
      defineProperty: $defineProperty,
      // 19.1.2.3 Object.defineProperties(O, Properties)
      defineProperties: $defineProperties,
      // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
      getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
      // 19.1.2.7 Object.getOwnPropertyNames(O)
      getOwnPropertyNames: $getOwnPropertyNames,
      // 19.1.2.8 Object.getOwnPropertySymbols(O)
      getOwnPropertySymbols: $getOwnPropertySymbols
    });
    
    // 24.3.2 JSON.stringify(value [, replacer [, space]])
    $JSON && $export($export.S + $export.F * (!useNative || buggyJSON), 'JSON', {stringify: $stringify});
    
    // 19.4.3.5 Symbol.prototype[@@toStringTag]
    setToStringTag($Symbol, 'Symbol');
    // 20.2.1.9 Math[@@toStringTag]
    setToStringTag(Math, 'Math', true);
    // 24.3.3 JSON[@@toStringTag]
    setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 18 */
/***/ function(module, exports) {

    // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    var global = module.exports = typeof window != 'undefined' && window.Math == Math
      ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
    if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 19 */
/***/ function(module, exports) {

    var hasOwnProperty = {}.hasOwnProperty;
    module.exports = function(it, key){
      return hasOwnProperty.call(it, key);
    };

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

    // Thank's IE8 for his funny defineProperty
    module.exports = !__webpack_require__(21)(function(){
      return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
    });

/***/ },
/* 21 */
/***/ function(module, exports) {

    module.exports = function(exec){
      try {
        return !!exec();
      } catch(e){
        return true;
      }
    };

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

    var global    = __webpack_require__(18)
      , core      = __webpack_require__(23)
      , ctx       = __webpack_require__(24)
      , PROTOTYPE = 'prototype';
    
    var $export = function(type, name, source){
      var IS_FORCED = type & $export.F
        , IS_GLOBAL = type & $export.G
        , IS_STATIC = type & $export.S
        , IS_PROTO  = type & $export.P
        , IS_BIND   = type & $export.B
        , IS_WRAP   = type & $export.W
        , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
        , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
        , key, own, out;
      if(IS_GLOBAL)source = name;
      for(key in source){
        // contains in native
        own = !IS_FORCED && target && key in target;
        if(own && key in exports)continue;
        // export native or passed
        out = own ? target[key] : source[key];
        // prevent global pollution for namespaces
        exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
        // bind timers to global for call from export context
        : IS_BIND && own ? ctx(out, global)
        // wrap global constructors for prevent change them in library
        : IS_WRAP && target[key] == out ? (function(C){
          var F = function(param){
            return this instanceof C ? new C(param) : C(param);
          };
          F[PROTOTYPE] = C[PROTOTYPE];
          return F;
        // make static versions for prototype methods
        })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
        if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
      }
    };
    // type bitmap
    $export.F = 1;  // forced
    $export.G = 2;  // global
    $export.S = 4;  // static
    $export.P = 8;  // proto
    $export.B = 16; // bind
    $export.W = 32; // wrap
    module.exports = $export;

/***/ },
/* 23 */
/***/ function(module, exports) {

    var core = module.exports = {version: '1.2.6'};
    if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

    // optional / simple context binding
    var aFunction = __webpack_require__(25);
    module.exports = function(fn, that, length){
      aFunction(fn);
      if(that === undefined)return fn;
      switch(length){
        case 1: return function(a){
          return fn.call(that, a);
        };
        case 2: return function(a, b){
          return fn.call(that, a, b);
        };
        case 3: return function(a, b, c){
          return fn.call(that, a, b, c);
        };
      }
      return function(/* ...args */){
        return fn.apply(that, arguments);
      };
    };

/***/ },
/* 25 */
/***/ function(module, exports) {

    module.exports = function(it){
      if(typeof it != 'function')throw TypeError(it + ' is not a function!');
      return it;
    };

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(27);

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

    var $          = __webpack_require__(4)
      , createDesc = __webpack_require__(28);
    module.exports = __webpack_require__(20) ? function(object, key, value){
      return $.setDesc(object, key, createDesc(1, value));
    } : function(object, key, value){
      object[key] = value;
      return object;
    };

/***/ },
/* 28 */
/***/ function(module, exports) {

    module.exports = function(bitmap, value){
      return {
        enumerable  : !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable    : !(bitmap & 4),
        value       : value
      };
    };

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

    var global = __webpack_require__(18)
      , SHARED = '__core-js_shared__'
      , store  = global[SHARED] || (global[SHARED] = {});
    module.exports = function(key){
      return store[key] || (store[key] = {});
    };

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

    var def = __webpack_require__(4).setDesc
      , has = __webpack_require__(19)
      , TAG = __webpack_require__(31)('toStringTag');
    
    module.exports = function(it, tag, stat){
      if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
    };

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

    var store  = __webpack_require__(29)('wks')
      , uid    = __webpack_require__(32)
      , Symbol = __webpack_require__(18).Symbol;
    module.exports = function(name){
      return store[name] || (store[name] =
        Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
    };

/***/ },
/* 32 */
/***/ function(module, exports) {

    var id = 0
      , px = Math.random();
    module.exports = function(key){
      return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
    };

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

    var $         = __webpack_require__(4)
      , toIObject = __webpack_require__(34);
    module.exports = function(object, el){
      var O      = toIObject(object)
        , keys   = $.getKeys(O)
        , length = keys.length
        , index  = 0
        , key;
      while(length > index)if(O[key = keys[index++]] === el)return key;
    };

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

    // to indexed object, toObject with fallback for non-array-like ES3 strings
    var IObject = __webpack_require__(35)
      , defined = __webpack_require__(37);
    module.exports = function(it){
      return IObject(defined(it));
    };

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

    // fallback for non-array-like ES3 and non-enumerable old V8 strings
    var cof = __webpack_require__(36);
    module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
      return cof(it) == 'String' ? it.split('') : Object(it);
    };

/***/ },
/* 36 */
/***/ function(module, exports) {

    var toString = {}.toString;
    
    module.exports = function(it){
      return toString.call(it).slice(8, -1);
    };

/***/ },
/* 37 */
/***/ function(module, exports) {

    // 7.2.1 RequireObjectCoercible(argument)
    module.exports = function(it){
      if(it == undefined)throw TypeError("Can't call method on  " + it);
      return it;
    };

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

    // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
    var toIObject = __webpack_require__(34)
      , getNames  = __webpack_require__(4).getNames
      , toString  = {}.toString;
    
    var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
      ? Object.getOwnPropertyNames(window) : [];
    
    var getWindowNames = function(it){
      try {
        return getNames(it);
      } catch(e){
        return windowNames.slice();
      }
    };
    
    module.exports.get = function getOwnPropertyNames(it){
      if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
      return getNames(toIObject(it));
    };

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

    // all enumerable object keys, includes symbols
    var $ = __webpack_require__(4);
    module.exports = function(it){
      var keys       = $.getKeys(it)
        , getSymbols = $.getSymbols;
      if(getSymbols){
        var symbols = getSymbols(it)
          , isEnum  = $.isEnum
          , i       = 0
          , key;
        while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
      }
      return keys;
    };

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

    // 7.2.2 IsArray(argument)
    var cof = __webpack_require__(36);
    module.exports = Array.isArray || function(arg){
      return cof(arg) == 'Array';
    };

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

    var isObject = __webpack_require__(42);
    module.exports = function(it){
      if(!isObject(it))throw TypeError(it + ' is not an object!');
      return it;
    };

/***/ },
/* 42 */
/***/ function(module, exports) {

    module.exports = function(it){
      return typeof it === 'object' ? it !== null : typeof it === 'function';
    };

/***/ },
/* 43 */
/***/ function(module, exports) {

    module.exports = true;

/***/ },
/* 44 */
/***/ function(module, exports) {



/***/ }
/******/ ])
});
;
//# sourceMappingURL=microdi.js.map