(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
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
    
    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
    
    var _srcContainer = __webpack_require__(1);
    
    var _srcContainer2 = _interopRequireDefault(_srcContainer);
    
    exports['default'] = { Container: _srcContainer2['default'] };
    module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

    'use strict';
    
    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    
    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
    
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
    
    var _utils = __webpack_require__(2);
    
    var _utils2 = _interopRequireDefault(_utils);
    
    var _ResolverContext = __webpack_require__(3);
    
    var _ResolverContext2 = _interopRequireDefault(_ResolverContext);
    
    var _InstanceLifecycleType = __webpack_require__(4);
    
    var _InstanceLifecycleType2 = _interopRequireDefault(_InstanceLifecycleType);
    
    var _InstanceLifecycle = __webpack_require__(5);
    
    var _InstanceLifecycle2 = _interopRequireDefault(_InstanceLifecycle);
    
    var Container = (function () {
        function Container() {
            _classCallCheck(this, Container);
    
            this._isChildContainer = false;
            this._parent = undefined;
            this._registrations = {};
            this._instanceCache = {};
            this._resolverContext = new _ResolverContext2['default']();
            this._resolvers = this._createDefaultResolvers();
            this._isDisposed = false;
            this._childContainers = [];
        }
    
        _createClass(Container, [{
            key: 'createChildContainer',
            value: function createChildContainer() {
                if (this._isDisposed) this._throwIsDisposed();
                // The child prototypically inherits some but not all props from its parent.
                // Below we override the ones it doesn't inherit.
                var child = Object.create(this);
                child._parent = this;
                child._isChildContainer = true;
                child._registrations = Object.create(this._registrations);
                child._instanceCache = Object.create(this._instanceCache);
                child._resolvers = Object.create(this._resolvers);
                child._isDisposed = false;
                child._childContainers = [];
                this._childContainers.push(child);
                return child;
            }
        }, {
            key: 'register',
            value: function register(name, proto, dependencyList) {
                if (this._isDisposed) this._throwIsDisposed();
                this._validateDependencyList(dependencyList);
                var registration = {
                    name: name,
                    proto: proto,
                    dependencyList: dependencyList,
                    instanceLifecycleType: _InstanceLifecycleType2['default'].singleton
                };
                this._registrations[name] = registration;
                return new _InstanceLifecycle2['default'](registration, this._instanceCache);
            }
        }, {
            key: 'registerInstance',
            value: function registerInstance(name, instance) {
                if (this._isDisposed) this._throwIsDisposed();
                var registration = {
                    name: name,
                    instanceLifecycleType: _InstanceLifecycleType2['default'].external
                };
                this._registrations[name] = registration;
                this._instanceCache[name] = instance;
            }
        }, {
            key: 'resolve',
            value: function resolve(name) {
                if (this._isDisposed) this._throwIsDisposed();
                var registration = this._registrations[name],
                    dependency,
                    instance,
                    error;
                if (!registration) {
                    error = _utils2['default'].sprintf('Nothing registered for dependency [%s]', name);
                    throw new Error(error);
                }
                instance = this._tryRetrieveFromCache(name);
                if (!instance) {
                    instance = this._buildInstance(name);
                    if (registration.instanceLifecycleType === _InstanceLifecycleType2['default'].singleton || registration.instanceLifecycleType === _InstanceLifecycleType2['default'].singletonPerContainer) {
                        this._instanceCache[name] = instance;
                    }
                }
                return instance;
            }
        }, {
            key: 'addResolver',
            value: function addResolver(type, resolver) {
                if (this._isDisposed) this._throwIsDisposed();
                this._resolvers[type] = resolver;
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
                        typeIsSingleton = registration.instanceLifecycleType === _InstanceLifecycleType2['default'].singleton;
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
                            parentRegistrationIsSingletonPerContainer = !thisContainerOwnsRegistration && registration.instanceLifecycleType === _InstanceLifecycleType2['default'].singletonPerContainer;
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
            value: function _buildInstance(name) {
                var registration = this._registrations[name],
                    dependencies = [],
                    dependency,
                    dependencyKey,
                    i,
                    context,
                    instance,
                    resolver;
                context = this._resolverContext.beginResolve(name);
                try {
                    if (registration.dependencyList !== undefined) {
                        for (i = 0; i < registration.dependencyList.length; i++) {
                            dependencyKey = registration.dependencyList[i];
                            if (_utils2['default'].isString(dependencyKey)) {
                                dependency = this.resolve(dependencyKey);
                            } else if (dependencyKey.hasOwnProperty('type') && _utils2['default'].isString(dependencyKey.type)) {
                                resolver = this._resolvers[dependencyKey.type];
                                if (resolver === undefined) {
                                    throw new Error(_utils2['default'].sprintf('Error resolving [%s]. No resolver registered to resolve dependency key for type [%s]', name, dependencyKey.type));
                                }
                                dependency = resolver.resolve(this, dependencyKey);
                            } else {
                                throw new Error(_utils2['default'].sprintf('Error resolving [%s]. It\'s dependency at index [%s] had an unknown resolver type', name, i));
                            }
                            dependencies.push(dependency);
                        }
                    }
                    if (typeof registration.proto === 'function') {
                        // haven't really tested this working with constructor functions too much
                        // code ripped from here http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
                        var Ctor = registration.proto.bind.apply(registration.proto, [null].concat(dependencies));
                        instance = new Ctor();
                    } else {
                        instance = Object.create(registration.proto);
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
            key: '_validateDependencyList',
            value: function _validateDependencyList(dependencyList) {}
        }, {
            key: '_createDefaultResolvers',
            value: function _createDefaultResolvers() {
                return {
                    // A resolvers that delegates to the dependency keys resolve method to perform the resolution.
                    // It expects a dependency key in format:
                    // { type: 'factory', resolve: function(container) { return someInstance } }
                    factory: {
                        resolve: function resolve(container, dependencyKey) {
                            return dependencyKey.resolve(container);
                        }
                    },
                    // A resolvers that returns a factory that when called will resolve the dependency from the container.
                    // It expects a dependency key in format:
                    // { type: 'autoFactory', name: "aDependencyName" }
                    autoFactory: {
                        resolve: function resolve(container, dependencyKey) {
                            return function () {
                                return container.resolve(dependencyKey.name);
                            };
                        }
                    }
                };
            }
        }, {
            key: '_throwIsDisposed',
            value: function _throwIsDisposed() {
                throw new Error('Container has been disposed');
            }
        }, {
            key: '_disposeContainer',
            value: function _disposeContainer() {
                if (!this._isDisposed) {
                    this._isDisposed = true;
                    for (var prop in this._instanceCache) {
                        if (this._instanceCache.hasOwnProperty(prop)) {
                            var registration = this._registrations[prop];
                            if (registration.instanceLifecycleType !== _InstanceLifecycleType2['default'].external) {
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
    })();
    
    exports['default'] = Container;
    module.exports = exports['default'];

    // TODO

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

    'use strict';
    
    exports.sprintf = function sprintf(format, etc) {
        var arg = arguments;
        var i = 1;
        return format.replace(/%((%)|s)/g, function (m) {
            return m[2] || arg[i++];
        });
    };
    
    exports.isString = function (value) {
        return typeof value == 'string' || value instanceof String;
    };

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

    // helper to track circular dependencies during a resolve call
    'use strict';
    
    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    
    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
    
    var ResolverContext = (function () {
        function ResolverContext() {
            _classCallCheck(this, ResolverContext);
    
            this._isResolving = false;
            this._resolutionChain = [];
            this._hasEnded = false;
        }
    
        _createClass(ResolverContext, [{
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
    })();
    
    exports['default'] = ResolverContext;
    module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

    'use strict';
    
    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    exports['default'] = {
        transient: 'transient',
        singleton: 'singleton',
        singletonPerContainer: 'singletonPerContainer',
        external: 'external'
    };
    module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

    'use strict';
    
    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    
    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
    
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
    
    var _utils = __webpack_require__(2);
    
    var _utils2 = _interopRequireDefault(_utils);
    
    var _InstanceLifecycleType = __webpack_require__(4);
    
    var _InstanceLifecycleType2 = _interopRequireDefault(_InstanceLifecycleType);
    
    var InstanceLifecycle = (function () {
        function InstanceLifecycle(registration, instanceCache) {
            _classCallCheck(this, InstanceLifecycle);
    
            this._registration = registration;
            this._instanceCache = instanceCache;
            this.singleton();
        }
    
        _createClass(InstanceLifecycle, [{
            key: 'transient',
            value: function transient() {
                this._ensureInstanceNotCreated();
                this._registration.instanceLifecycleType = _InstanceLifecycleType2['default'].transient;
            }
        }, {
            key: 'singleton',
            value: function singleton() {
                this._ensureInstanceNotCreated();
                this._registration.instanceLifecycleType = _InstanceLifecycleType2['default'].singleton;
            }
        }, {
            key: 'singletonPerContainer',
            value: function singletonPerContainer() {
                this._ensureInstanceNotCreated();
                this._registration.instanceLifecycleType = _InstanceLifecycleType2['default'].singletonPerContainer;
            }
        }, {
            key: '_ensureInstanceNotCreated',
            value: function _ensureInstanceNotCreated() {
                if (this._registration.hasOwnProperty(this._registration.name) && this._instanceCache.hasOwnProperty(this._registration.name)) throw new Error(_utils2['default'].sprintf('Instance already created for key [%s]', this._registration.name));
            }
        }]);
    
        return InstanceLifecycle;
    })();
    
    exports['default'] = InstanceLifecycle;
    module.exports = exports['default'];

/***/ }
/******/ ])
});
;
//# sourceMappingURL=microdi.js.map