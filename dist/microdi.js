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
    
    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
    
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
    
    var _utils = __webpack_require__(2);
    
    var utils = _interopRequireWildcard(_utils);
    
    var _ResolverContext = __webpack_require__(3);
    
    var _ResolverContext2 = _interopRequireDefault(_ResolverContext);
    
    var _InstanceLifecycleType = __webpack_require__(4);
    
    var _InstanceLifecycleType2 = _interopRequireDefault(_InstanceLifecycleType);
    
    var _RegistrationModifier = __webpack_require__(5);
    
    var _RegistrationModifier2 = _interopRequireDefault(_RegistrationModifier);
    
    var Container = (function () {
        function Container() {
            _classCallCheck(this, Container);
    
            this._isChildContainer = false;
            this._parent = undefined;
            this._registrations = {};
            this._registrationGroups = {};
            this._instanceCache = {};
            this._resolverContext = new _ResolverContext2['default']();
            this._resolvers = this._createDefaultResolvers();
            this._isDisposed = false;
            this._childContainers = [];
        }
    
        _createClass(Container, [{
            key: 'createChildContainer',
            value: function createChildContainer() {
                this._throwIfDisposed();
                // The child prototypically inherits some but not all props from its parent.
                // Below we override the ones it doesn't inherit.
                var child = Object.create(this);
                child._parent = this;
                child._isChildContainer = true;
                child._registrations = Object.create(this._registrations);
                child._registrationGroups = Object.create(this._registrationGroups);
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
                this._throwIfDisposed();
                this._validateDependencyList(dependencyList);
                var registration = {
                    name: name,
                    proto: proto,
                    dependencyList: dependencyList,
                    instanceLifecycleType: _InstanceLifecycleType2['default'].singleton
                };
                this._registrations[name] = registration;
                return new _RegistrationModifier2['default'](registration, this._instanceCache, this._registrationGroups);
            }
        }, {
            key: 'registerInstance',
            value: function registerInstance(name, instance) {
                var isExternallyOwned = arguments[2] === undefined ? true : arguments[2];
    
                this._throwIfDisposed();
                this._registrations[name] = {
                    name: name,
                    instanceLifecycleType: isExternallyOwned ? _InstanceLifecycleType2['default'].external : _InstanceLifecycleType2['default'].singleton
                };
                this._instanceCache[name] = instance;
            }
        }, {
            key: 'resolve',
            value: function resolve(name) {
                for (var _len = arguments.length, additionalDependencies = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    additionalDependencies[_key - 1] = arguments[_key];
                }
    
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
                if (!instance) {
                    instance = this._buildInstance(name, additionalDependencies);
                    if (registration.instanceLifecycleType === _InstanceLifecycleType2['default'].singleton || registration.instanceLifecycleType === _InstanceLifecycleType2['default'].singletonPerContainer) {
                        this._instanceCache[name] = instance;
                    }
                } else if (additionalDependencies.length > 0) {
                    throw new Error('The provided additional dependencies can\'t be used to construct the instance as an existing instance was found in the container');
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
            value: function addResolver(type, resolver) {
                this._throwIfDisposed();
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
                            } else if (dependencyKey.hasOwnProperty('type') && utils.isString(dependencyKey.type)) {
                                resolver = this._resolvers[dependencyKey.type];
                                if (resolver === undefined) {
                                    throw new Error(utils.sprintf('Error resolving [%s]. No resolver registered to resolve dependency key for type [%s]', name, dependencyKey.type));
                                }
                                dependency = resolver.resolve(this, dependencyKey);
                            } else {
                                throw new Error(utils.sprintf('Error resolving [%s]. It\'s dependency at index [%s] had an unknown resolver type', name, i));
                            }
                            dependencies.push(dependency);
                        }
                    }
                    for (var j = 0, len = additionalDependencies.length; j < len; j++) {
                        dependencies.push(additionalDependencies[j]);
                    }
                    if (registration.proto.isResolerKey) {
                        if (registration.proto.type) {
                            resolver = this._resolvers[registration.proto.type];
                            instance = resolver.resolve(this, registration.proto);
                        } else {
                            throw new Error('Registered resolverKey is missing it\'s type property');
                        }
                    } else if (typeof registration.proto === 'function') {
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
                    delegate: {
                        resolve: function resolve(container, dependencyKey) {
                            return dependencyKey.resolve(container);
                        }
                    },
                    // A resolvers that returns a factory that when called will resolve the dependency from the container.
                    // Any arguments passed at runtime will be passed to resolve as additional dependencies
                    // It expects a dependency key in format:
                    // { type: 'factory', name: "aDependencyName" }
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
                if (this._isDisposed) throw new Error('Container has been disposed');
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
    
    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    exports.sprintf = sprintf;
    exports.isString = isString;
    exports.indexOf = indexOf;
    
    function sprintf(format, etc) {
        var arg = arguments;
        var i = 1;
        return format.replace(/%((%)|s)/g, function (m) {
            return m[2] || arg[i++];
        });
    }
    
    function isString(value) {
        return typeof value == 'string' || value instanceof String;
    }
    
    function indexOf(array, item) {
        var iOf;
        if (typeof Array.prototype.indexOf === 'function') {
            iOf = Array.prototype.indexOf;
        } else {
            iOf = function (item) {
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

    'use strict';
    
    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    
    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
    
    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
    
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
    
    var _utilsJs = __webpack_require__(2);
    
    var utils = _interopRequireWildcard(_utilsJs);
    
    // helper to track circular dependencies during a resolve call
    
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
    
    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
    
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
    
    var _utils = __webpack_require__(2);
    
    var utils = _interopRequireWildcard(_utils);
    
    var _InstanceLifecycleType = __webpack_require__(4);
    
    var _InstanceLifecycleType2 = _interopRequireDefault(_InstanceLifecycleType);
    
    var RegistrationModifier = (function () {
        function RegistrationModifier(registration, instanceCache, registrationGroups) {
            _classCallCheck(this, RegistrationModifier);
    
            this._registration = registration;
            this._instanceCache = instanceCache;
            this._registrationGroups = registrationGroups;
            this.singleton();
        }
    
        _createClass(RegistrationModifier, [{
            key: 'transient',
            value: function transient() {
                this._ensureInstanceNotCreated();
                this._registration.instanceLifecycleType = _InstanceLifecycleType2['default'].transient;
                return this;
            }
        }, {
            key: 'singleton',
            value: function singleton() {
                this._ensureInstanceNotCreated();
                this._registration.instanceLifecycleType = _InstanceLifecycleType2['default'].singleton;
                return this;
            }
        }, {
            key: 'singletonPerContainer',
            value: function singletonPerContainer() {
                this._ensureInstanceNotCreated();
                this._registration.instanceLifecycleType = _InstanceLifecycleType2['default'].singletonPerContainer;
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
        }]);
    
        return RegistrationModifier;
    })();
    
    exports['default'] = RegistrationModifier;
    module.exports = exports['default'];

/***/ }
/******/ ])
});
;
//# sourceMappingURL=microdi.js.map