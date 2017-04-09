module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(__webpack_require__(1));
	__export(__webpack_require__(35));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__webpack_require__(10);
	__export(__webpack_require__(10));
	var decimal_1 = __webpack_require__(17);
	exports.Decimal = decimal_1.default;
	var decimalFormat_1 = __webpack_require__(9);
	exports.DecimalFormat = decimalFormat_1.default;
	var guard_1 = __webpack_require__(2);
	exports.Guard = guard_1.default;
	var environment_1 = __webpack_require__(18);
	exports.Environment = environment_1.default;
	__export(__webpack_require__(4));
	var logger_1 = __webpack_require__(4);
	exports.Logger = logger_1.default;
	__export(__webpack_require__(22));
	var utils_1 = __webpack_require__(3);
	exports.Utils = utils_1.default;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const utils_1 = __webpack_require__(3);
	class Guard {
	    static isDefined(value, message) {
	        if (typeof value === 'undefined') {
	            doThrow(message);
	        }
	    }
	    static isFalse(value, message) {
	        if (value) {
	            doThrow(message);
	        }
	    }
	    static lengthIs(array, expectedLength, message) {
	        if (array.length !== expectedLength) {
	            doThrow(message);
	        }
	    }
	    static lengthGreaterThan(array, expectedLength, message) {
	        if (array.length < expectedLength) {
	            doThrow(message);
	        }
	    }
	    static lengthIsAtLeast(array, expectedLength, message) {
	        if (array.length < expectedLength) {
	            doThrow(message);
	        }
	    }
	    static isString(value, message) {
	        if (!utils_1.default.isString(value)) {
	            doThrow(message);
	        }
	    }
	    static stringIsNotEmpty(value, message) {
	        if (!utils_1.default.isString(value) || value === '') {
	            doThrow(message);
	        }
	    }
	    static isTrue(item, message) {
	        if (!item) {
	            doThrow(message);
	        }
	    }
	    static isFunction(value, message) {
	        if (typeof (value) !== 'function') {
	            doThrow(message);
	        }
	    }
	    static isNumber(value, message) {
	        if (isNaN(value)) {
	            doThrow(message);
	        }
	    }
	    static isObject(value, message) {
	        if (typeof value !== 'object') {
	            doThrow(message);
	        }
	    }
	    static isBoolean(value, message) {
	        if (typeof (value) !== 'boolean') {
	            doThrow(message);
	        }
	    }
	}
	exports.default = Guard;
	function doThrow(message) {
	    if (typeof message === 'undefined' || message === '') {
	        throw new Error('Argument error');
	    }
	    throw new Error(message);
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	class Utils {
	    static parseBool(input) {
	        if (input === null || typeof input === 'undefined') {
	            return false;
	        }
	        switch (input.toLowerCase()) {
	            case 'true':
	                return true;
	            case 'false':
	                return false;
	            default:
	                return false;
	        }
	    }
	    ;
	    static isString(value) {
	        return typeof value === 'string' || value instanceof String;
	    }
	    static isInt(n) {
	        return Number(n) % 1 === 0;
	    }
	}
	exports.default = Utils;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const guard_1 = __webpack_require__(2);
	var Level;
	(function (Level) {
	    Level[Level["verbose"] = 0] = "verbose";
	    Level[Level["debug"] = 1] = "debug";
	    Level[Level["info"] = 2] = "info";
	    Level[Level["warn"] = 3] = "warn";
	    Level[Level["error"] = 4] = "error";
	})(Level = exports.Level || (exports.Level = {}));
	;
	// note: if you want verbose you need to change this explictly, this is just the initial default
	let _currentLevel = Level.debug;
	let _sink = (logEvent) => {
	    let dateTime = new Date();
	    const toLog = [`%c[${dateTime.toLocaleString()}.${dateTime.getMilliseconds()}][${Level[logEvent.level]}][${logEvent.logger}]`, `color:${logEvent.color}`];
	    toLog.push.apply(toLog, logEvent.args);
	    console.log.apply(console, toLog);
	};
	class Logger {
	    constructor(name) {
	        this._name = name;
	    }
	    static create(name) {
	        guard_1.default.isDefined(name, 'The name argument should be defined');
	        guard_1.default.isString(name, 'The name argument should be a string');
	        return new Logger(name);
	    }
	    static setLevel(level) {
	        _currentLevel = level;
	    }
	    static setSink(sink) {
	        _sink = sink;
	    }
	    /**
	     * verbose(message [, ...args]): expects a string log message and optional object to dump to console
	     */
	    verbose(message, objectToDumpToConsole) {
	        if (_currentLevel <= Level.verbose) {
	            this._log(Level.verbose, null, arguments);
	        }
	    }
	    /**
	     * debug(message [, ...args]): expects a string log message and optional object to dump to console
	     */
	    debug(message, objectToDumpToConsole) {
	        if (_currentLevel <= Level.debug) {
	            this._log(Level.debug, null, arguments);
	        }
	    }
	    /**
	     * info(message [, ...args]): expects a string log message and optional object to dump to console
	     */
	    info(message, objectToDumpToConsole) {
	        if (_currentLevel <= Level.info) {
	            this._log(Level.info, 'blue', arguments);
	        }
	    }
	    /**
	     * warn(message [, ...args]): expects a string log message and optional object to dump to console
	     */
	    warn(message, objectToDumpToConsole) {
	        if (_currentLevel <= Level.warn) {
	            this._log(Level.warn, 'orange', arguments);
	        }
	    }
	    /**
	     * error(message [, ...args]): expects a string log message and optional object to dump to console
	     */
	    error(message, objectToDumpToConsole) {
	        if (_currentLevel <= Level.error) {
	            this._log(Level.error, 'red', arguments);
	        }
	    }
	    _log(level, color, args) {
	        _sink({
	            logger: this._name,
	            level: level,
	            color: color || 'black',
	            args: args
	        });
	    }
	}
	exports.default = Logger;


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("react");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("rx");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const React = __webpack_require__(5);
	class ViewBase extends React.Component {
	}
	exports.default = ViewBase;


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("esp-js");

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	class DecimalFormat {
	}
	DecimalFormat.ToString = (decimal) => decimal.value.toFixed(decimal.scale);
	DecimalFormat.ToLocal = (decimal) => decimal.value.toLocaleString();
	exports.default = DecimalFormat;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	// retryWithPolicy doesn't have exports but it does add ext methods to rx
	__webpack_require__(20);
	__webpack_require__(21);
	var retryPolicy_1 = __webpack_require__(19);
	exports.RetryPolicy = retryPolicy_1.default;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// pulled from https://github.com/AdaptiveConsulting/ReactiveTraderCloud
	// licence Apache 2
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const esp_js_1 = __webpack_require__(8);
	const core_1 = __webpack_require__(1);
	let _log = core_1.Logger.create('ModelBase');
	class ModelBase extends esp_js_1.DisposableBase {
	    constructor(modelId, router) {
	        super();
	        core_1.Guard.isString(modelId, 'modelId required and must be a string');
	        core_1.Guard.isDefined(router, 'router required');
	        this._modelId = modelId;
	        this._router = router;
	    }
	    observeEvents() {
	        _log.debug(`Adding model with id ${this._modelId} to router`);
	        this.router.addModel(this._modelId, this);
	        this.addDisposable(() => {
	            _log.debug(`Removing model with id ${this._modelId} from router`);
	            this.router.removeModel(this._modelId);
	        });
	        this.addDisposable(this.router.observeEventsOn(this._modelId, this));
	    }
	    // override if you're a component (i.e. created by a component factory)
	    // and want to take part in saving and loading state.
	    // It should be a normal object which will get stringified
	    getState() {
	        return null;
	    }
	    /**
	     * Runs the given action on the dispatch loop for this model, ensures that any model observer will be notified of the change
	     * @param action
	     */
	    ensureOnDispatchLoop(action) {
	        // TODO update when https://github.com/esp/esp-js/issues/86 is implemented
	        this.router.runAction(this.modelId, () => {
	            action();
	        });
	    }
	    get modelId() {
	        return this._modelId;
	    }
	    get router() {
	        return this._router;
	    }
	}
	exports.default = ModelBase;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const React = __webpack_require__(5);
	class TileItemView extends React.Component {
	    render() {
	        let className = this.props.className ? this.props.className : 'tile-item-container';
	        return (React.createElement("div", { style: this.props.style, className: className }, this.props.children));
	    }
	}
	exports.default = TileItemView;


/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	class RegionItem {
	    constructor(title, modelId, displayContext) {
	        this.title = title;
	        this.modelId = modelId;
	        this.displayContext = displayContext;
	    }
	    get itemKey() {
	        if (typeof this.displayContext === 'undefined') {
	            return this.modelId;
	        }
	        else {
	            return `${this.modelId}${this.displayContext}`;
	        }
	    }
	    equals(modelId, displayContext) {
	        return this.modelId === modelId && this.displayContext === displayContext;
	    }
	}
	exports.default = RegionItem;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const core_1 = __webpack_require__(1);
	const modelBase_1 = __webpack_require__(11);
	let _log = core_1.Logger.create('RegionsModelBase');
	let _modelIdSeed = 1;
	let idFactory = () => { return 'region#' + (++_modelIdSeed); };
	class RegionModelBase extends modelBase_1.default {
	    constructor(regionName, router, regionManager) {
	        super(idFactory(), router);
	        this._regionName = regionName;
	        this._regionManager = regionManager;
	    }
	    observeEvents() {
	        super.observeEvents();
	        _log.verbose('starting. Adding model and observing events');
	        this._registerWithRegionManager(this._regionName);
	    }
	    getTitle() {
	        return '';
	    }
	    _registerWithRegionManager(regionName) {
	        this._regionManager.registerRegion(regionName, 
	        // on add
	        (model, displayContext) => {
	            this._router.runAction(this.modelId, () => {
	                _log.debug(`Adding model with id ${model.modelId} (display context:'${displayContext || 'n/a'}') to region ${regionName}`);
	                this._addToRegion(model.getTitle(), model.modelId, displayContext);
	            });
	        }, 
	        // on remove
	        (model, displayContext) => {
	            this._router.runAction(this.modelId, () => {
	                _log.debug(`Removing model with id ${model.modelId} (display context:'${displayContext || 'n/a'}') from region ${regionName}`);
	                this._removeFromRegion(model.modelId, displayContext);
	            });
	        });
	        this.addDisposable(() => {
	            this._regionManager.unregisterRegion(regionName);
	        });
	    }
	}
	exports.default = RegionModelBase;


/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = require("classnames");

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = require("esp-js-react");

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const utils_1 = __webpack_require__(3);
	const guard_1 = __webpack_require__(2);
	const decimalFormat_1 = __webpack_require__(9);
	class Decimal {
	    static parse(value) {
	        if (isNaN(value)) {
	            return null;
	        }
	        let x = utils_1.default.isString(value)
	            ? value // preserve any trailing zeros
	            : parseFloat(value) + ''; // removes any trailing zeros
	        let indexOfPoint = x.indexOf('.');
	        if (indexOfPoint === -1) {
	            return new Decimal(Number(x), 0);
	        }
	        return new Decimal(Number(x.replace('.', '')), x.length - 1 - indexOfPoint);
	    }
	    constructor(unscaledValue, scale = 0) {
	        guard_1.default.isTrue(utils_1.default.isInt(unscaledValue), 'unscaledValue must be an int');
	        guard_1.default.isTrue(utils_1.default.isInt(scale), 'scale must be an int');
	        this._unscaledValue = unscaledValue;
	        this._scale = scale;
	    }
	    get unscaledValue() {
	        return this._unscaledValue;
	    }
	    get scale() {
	        return this._scale;
	    }
	    get value() {
	        let pip = 1 / Math.pow(10, this._scale);
	        return Number((this._unscaledValue * pip).toFixed(this._scale));
	    }
	    format(formatter) {
	        if (formatter) {
	            return formatter(this);
	        }
	        else {
	            return decimalFormat_1.default.ToString(this);
	        }
	    }
	}
	exports.default = Decimal;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const queryString = __webpack_require__(28);
	const utils_1 = __webpack_require__(3);
	/* tslint:disable */
	// http://stackoverflow.com/a/11381730
	let isRunningOnTablet = function () {
	    let check = false;
	    (function (a) {
	        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
	            check = true;
	        }
	    })(navigator.userAgent || navigator.vendor || window['opera']);
	    return check;
	}();
	class Environment {
	    static get isRunningOnTablet() {
	        return isRunningOnTablet || utils_1.default.parseBool(queryString.parse(location.search).isRunningOnTablet);
	    }
	}
	exports.default = Environment;


/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	class RetryPolicy {
	    static defaultPolicy(errorMessage) {
	        return new RetryPolicy('DefaultRetryPolicy', 3, 5000, errorMessage); // retry after 2 seconds, do the retry upto a max of 3 times
	    }
	    static none() {
	        return new RetryPolicy('NoneRetryPolicy', 0, 0, null); // do not retry
	    }
	    static createForUnlimitedRetry(description, retryAfterElapsedMs) {
	        return new RetryPolicy(description, -1, retryAfterElapsedMs, null);
	    }
	    // TODO a backoff policy, i.e. backoff to a given time then retry at max backoff
	    constructor(description, retryLimit, retryAfterElapsedMs, errorMessage) {
	        this._description = description;
	        this._retryLimit = retryLimit;
	        this._retryCount = 0;
	        this._errorMessage = errorMessage;
	        this._retryAfterElapsedMs = retryAfterElapsedMs;
	    }
	    get description() {
	        return this._description;
	    }
	    get shouldRetry() {
	        return this._retryLimit === -1 || this._retryCount < this._retryLimit;
	    }
	    get errorMessage() {
	        return this._errorMessage;
	    }
	    get retryAfterElapsedMs() {
	        return this._retryAfterElapsedMs;
	    }
	    get retryCount() {
	        return this._retryCount;
	    }
	    get retryLimit() {
	        return this._retryLimit;
	    }
	    incrementRetryCount() {
	        this._retryCount++;
	    }
	    reset() {
	        this._retryCount = 0;
	    }
	}
	exports.default = RetryPolicy;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const Rx = __webpack_require__(6);
	const logger_1 = __webpack_require__(4);
	const _log = logger_1.default.create('retryWithPolicy');
	Rx.Observable.prototype.retryWithPolicy = function (policy, onError, scheduler) {
	    let _scheduler = scheduler || Rx.Scheduler.async;
	    let _source = this;
	    return Rx.Observable.create(o => {
	        let disposable = new Rx.SerialDisposable(), isDisposed = false, isCompleted = false, hasError = false, subscribe, isRetry = false;
	        subscribe = () => {
	            // given we could try resubscribe via a timer callback, we need to ensure the stream is still value
	            if (!isDisposed && !isCompleted && !hasError) {
	                if (isRetry) {
	                    _log.debug(`operation [${policy.description}] retrying`);
	                }
	                disposable = _source.catch(err => {
	                    if (onError) {
	                        onError(err);
	                    }
	                    policy.incrementRetryCount();
	                    if (policy.shouldRetry) {
	                        let retryLimitMessage = policy.retryLimit === -1 ? 'unlimited' : policy.retryLimit;
	                        _log.error(`operation [${policy.description}] error: [${err}], scheduling retry after [${policy.retryAfterElapsedMs}]ms, this is attempt [${policy.retryCount}] of [${retryLimitMessage}]`);
	                        isRetry = true;
	                        // _scheduler.scheduleWithRelative(policy.retryAfterElapsedMs, subscribe);
	                        _scheduler.scheduleFuture('', policy.retryAfterElapsedMs, subscribe);
	                    }
	                    else {
	                        o.onError(new Error(`Retry policy reached retry limit of [${policy.retryCount}]. Error: [${policy.errorMessage}], Exception: [${err}]`));
	                    }
	                    return Rx.Observable.never();
	                }).subscribe(i => {
	                    policy.reset();
	                    o.onNext(i);
	                }, err => {
	                    hasError = true;
	                    o.onError(err);
	                }, () => {
	                    isCompleted = true;
	                    o.onCompleted();
	                });
	            }
	        };
	        subscribe();
	        return () => {
	            isDisposed = true;
	            disposable.dispose();
	        };
	    });
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const Rx = __webpack_require__(6);
	const guard_1 = __webpack_require__(2);
	/**
	 * Helper method to ease integration between Rx and Esp.
	 *
	 * When receiving results from an async operation (for example when results yield on an rx stream) you need to notify the esp router that a state change is about to occur for a given model.
	 * There are a few ways to do this:
	 * 1) publish an esp event in your rx subscription handler, handle the esp event as normal (the publish will have kicked off the the routers dispatch loop).
	 * 2) call router.runAction() in your subscription handler and deal with the results inline, again this kicks off the the routers dispatch loop.
	 * 3) use subscribeWithRouter which effectively wraps up method 2 for for all functions of subscribe (onNext, onError, onCompleted).
	 *
	 * @param router
	 * @param modelId : the model id you want to update
	 * @param onNext
	 * @param onError
	 * @param onCompleted
	 */
	Rx.Observable.prototype.subscribeWithRouter = function (router, modelId, onNext, onError, onCompleted) {
	    guard_1.default.isDefined(router, 'router should be defined');
	    guard_1.default.isString(modelId, 'modelId should be defined and a string');
	    let source = this;
	    return source.materialize().subscribe(i => {
	        switch (i.kind) {
	            case 'N':
	                if (onNext !== null && onNext !== undefined) {
	                    router.runAction(modelId, model => onNext(i.value, model));
	                }
	                break;
	            case 'E':
	                if (onError === null || onError === undefined) {
	                    throw i.error;
	                }
	                else {
	                    router.runAction(modelId, model => onError(i.error, model));
	                }
	                break;
	            case 'C':
	                if (onCompleted !== null && onCompleted !== undefined) {
	                    router.runAction(modelId, model => onCompleted(model));
	                }
	                break;
	            default:
	                throw new Error(`Unknown Notification Type. Type was ${i.kind}`);
	        }
	    });
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const Rx = __webpack_require__(6);
	class SchedulerService {
	    constructor() {
	        this._immediate = Rx.Scheduler.immediate;
	        this._async = Rx.Scheduler.default;
	    }
	    get immediate() {
	        return this._immediate;
	    }
	    get async() {
	        return this._async;
	    }
	}
	exports.SchedulerService = SchedulerService;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const core_1 = __webpack_require__(1);
	function getComponentFactoryMetadata(target) {
	    let constructorFunction = target.constructor;
	    if (constructorFunction.__componentMetadata) {
	        return constructorFunction.__componentMetadata;
	    }
	    throw new Error('No metadata found on component');
	}
	exports.getComponentFactoryMetadata = getComponentFactoryMetadata;
	function componentFactory(componentKey, shortName, showInAddComponentMenu = false) {
	    core_1.Guard.isDefined(componentKey, 'componentKey must be defined');
	    return (target) => {
	        target.__componentMetadata = new ComponentFactoryMetadata(componentKey, shortName, showInAddComponentMenu);
	    };
	}
	exports.componentFactory = componentFactory;
	class ComponentFactoryMetadata {
	    constructor(componentKey, shortName, showInAddComponentMenu = false) {
	        core_1.Guard.isString(componentKey, 'componentKey must be defined and be a string');
	        core_1.Guard.isString(shortName, 'shortName must be defined and be a string');
	        this._componentKey = componentKey;
	        this._shortName = shortName;
	        this._showInAddComponentMenu = showInAddComponentMenu;
	    }
	    get componentKey() {
	        return this._componentKey;
	    }
	    get shortName() {
	        return this._shortName;
	    }
	    get showInAddComponentMenu() {
	        return this._showInAddComponentMenu;
	    }
	}
	exports.ComponentFactoryMetadata = ComponentFactoryMetadata;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var componentRegistryModel_1 = __webpack_require__(32);
	exports.ComponentRegistryModel = componentRegistryModel_1.default;
	var componentFactoryBase_1 = __webpack_require__(31);
	exports.ComponentFactoryBase = componentFactoryBase_1.default;
	var componentDecorator_1 = __webpack_require__(23);
	exports.componentFactory = componentDecorator_1.componentFactory;
	exports.getComponentFactoryMetadata = componentDecorator_1.getComponentFactoryMetadata;
	exports.ComponentFactoryMetadata = componentDecorator_1.ComponentFactoryMetadata;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var multiTileRegionEventConst_1 = __webpack_require__(26);
	exports.MultiTileRegionEventConst = multiTileRegionEventConst_1.default;


/***/ },
/* 26 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	class MultiTileRegionEventConst {
	    static get selectedTileChanged() {
	        return 'selectedTileChanged';
	    }
	}
	exports.default = MultiTileRegionEventConst;


/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strictUriEncode = __webpack_require__(29);
	var objectAssign = __webpack_require__(27);

	function encoderForArrayFormat(opts) {
		switch (opts.arrayFormat) {
			case 'index':
				return function (key, value, index) {
					return value === null ? [
						encode(key, opts),
						'[',
						index,
						']'
					].join('') : [
						encode(key, opts),
						'[',
						encode(index, opts),
						']=',
						encode(value, opts)
					].join('');
				};

			case 'bracket':
				return function (key, value) {
					return value === null ? encode(key, opts) : [
						encode(key, opts),
						'[]=',
						encode(value, opts)
					].join('');
				};

			default:
				return function (key, value) {
					return value === null ? encode(key, opts) : [
						encode(key, opts),
						'=',
						encode(value, opts)
					].join('');
				};
		}
	}

	function parserForArrayFormat(opts) {
		var result;

		switch (opts.arrayFormat) {
			case 'index':
				return function (key, value, accumulator) {
					result = /\[(\d*)\]$/.exec(key);

					key = key.replace(/\[\d*\]$/, '');

					if (!result) {
						accumulator[key] = value;
						return;
					}

					if (accumulator[key] === undefined) {
						accumulator[key] = {};
					}

					accumulator[key][result[1]] = value;
				};

			case 'bracket':
				return function (key, value, accumulator) {
					result = /(\[\])$/.exec(key);

					key = key.replace(/\[\]$/, '');

					if (!result || accumulator[key] === undefined) {
						accumulator[key] = value;
						return;
					}

					accumulator[key] = [].concat(accumulator[key], value);
				};

			default:
				return function (key, value, accumulator) {
					if (accumulator[key] === undefined) {
						accumulator[key] = value;
						return;
					}

					accumulator[key] = [].concat(accumulator[key], value);
				};
		}
	}

	function encode(value, opts) {
		if (opts.encode) {
			return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
		}

		return value;
	}

	function keysSorter(input) {
		if (Array.isArray(input)) {
			return input.sort();
		} else if (typeof input === 'object') {
			return keysSorter(Object.keys(input)).sort(function (a, b) {
				return Number(a) - Number(b);
			}).map(function (key) {
				return input[key];
			});
		}

		return input;
	}

	exports.extract = function (str) {
		return str.split('?')[1] || '';
	};

	exports.parse = function (str, opts) {
		opts = objectAssign({arrayFormat: 'none'}, opts);

		var formatter = parserForArrayFormat(opts);

		// Create an object with no prototype
		// https://github.com/sindresorhus/query-string/issues/47
		var ret = Object.create(null);

		if (typeof str !== 'string') {
			return ret;
		}

		str = str.trim().replace(/^(\?|#|&)/, '');

		if (!str) {
			return ret;
		}

		str.split('&').forEach(function (param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			// Firefox (pre 40) decodes `%3D` to `=`
			// https://github.com/sindresorhus/query-string/pull/37
			var key = parts.shift();
			var val = parts.length > 0 ? parts.join('=') : undefined;

			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			formatter(decodeURIComponent(key), val, ret);
		});

		return Object.keys(ret).sort().reduce(function (result, key) {
			var val = ret[key];
			if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
				// Sort object keys, not values
				result[key] = keysSorter(val);
			} else {
				result[key] = val;
			}

			return result;
		}, Object.create(null));
	};

	exports.stringify = function (obj, opts) {
		var defaults = {
			encode: true,
			strict: true,
			arrayFormat: 'none'
		};

		opts = objectAssign(defaults, opts);

		var formatter = encoderForArrayFormat(opts);

		return obj ? Object.keys(obj).sort().map(function (key) {
			var val = obj[key];

			if (val === undefined) {
				return '';
			}

			if (val === null) {
				return encode(key, opts);
			}

			if (Array.isArray(val)) {
				var result = [];

				val.slice().forEach(function (val2) {
					if (val2 === undefined) {
						return;
					}

					result.push(formatter(key, val2, result.length));
				});

				return result.join('&');
			}

			return encode(key, opts) + '=' + encode(val, opts);
		}).filter(function (x) {
			return x.length > 0;
		}).join('&') : '';
	};


/***/ },
/* 29 */
/***/ function(module, exports) {

	'use strict';
	module.exports = function (str) {
		return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
			return '%' + c.charCodeAt(0).toString(16).toUpperCase();
		});
	};


/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const _ = __webpack_require__(30);
	const componentDecorator_1 = __webpack_require__(23);
	const esp_js_1 = __webpack_require__(8);
	class ComponentFactoryBase extends esp_js_1.DisposableBase {
	    constructor(container) {
	        super();
	        this._container = container;
	        this._currentComponents = [];
	        this._metadata = componentDecorator_1.getComponentFactoryMetadata(this);
	    }
	    get componentKey() {
	        return this._metadata.componentKey;
	    }
	    get shortName() {
	        return this._metadata.shortName;
	    }
	    get showInAddComponentMenu() {
	        return this._metadata.showInAddComponentMenu;
	    }
	    createComponent(state = null) {
	        let childContainer = this._container.createChildContainer();
	        let component = this._createComponent(childContainer, state);
	        component.addDisposable(childContainer);
	        component.addDisposable(() => {
	            let index = this._currentComponents.indexOf(component);
	            if (index > -1) {
	                this._currentComponents.splice(index, 1);
	            }
	            else {
	                throw new Error('Could not find a component in our set');
	            }
	        });
	        this._currentComponents.push(component);
	    }
	    getAllComponentsState() {
	        if (this._currentComponents.length === 0) {
	            return null;
	        }
	        let componentsState = _(this._currentComponents)
	            .map(c => c.getState())
	            .compact() // removes nulls
	            .value();
	        return {
	            componentFactoryKey: this.componentKey,
	            componentsState: componentsState
	        };
	    }
	    shutdownAllComponents() {
	        // copy the array as we have some disposal code that remove items on disposed
	        let components = this._currentComponents.slice();
	        _.forEach(components, component => {
	            component.dispose();
	        });
	        this._currentComponents.length = 0;
	    }
	}
	exports.default = ComponentFactoryBase;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const esp_js_1 = __webpack_require__(8);
	const core_1 = __webpack_require__(1);
	const modelBase_1 = __webpack_require__(11);
	const index_1 = __webpack_require__(24);
	let _log = core_1.Logger.create('ComponentRegistryModel');
	class ComponentRegistryModel extends modelBase_1.default {
	    constructor(modelId, router) {
	        super(modelId, router);
	        this._componentFactoriesEntries = new Map();
	    }
	    getTitle() {
	        return 'Components';
	    }
	    get componentFactories() {
	        return this._componentFactoriesEntries.values();
	    }
	    postProcess() {
	        this.componentsMetadata = [...this._getComponentsMetaData()];
	    }
	    registerComponentFactory(componentFactory) {
	        this.ensureOnDispatchLoop(() => {
	            core_1.Guard.isDefined(componentFactory, 'componentFactory must be defined');
	            let metadata = index_1.getComponentFactoryMetadata(componentFactory);
	            core_1.Guard.isFalse(this._componentFactoriesEntries.hasOwnProperty(metadata.componentKey), `component with id [${metadata.componentKey}] already added`);
	            _log.debug(`registering component factory with key [${metadata.componentKey}], shortname [${metadata.shortName}]`);
	            this._componentFactoriesEntries.set(metadata.componentKey, {
	                componentFactoryKey: metadata.componentKey,
	                factory: componentFactory,
	                shortName: metadata.shortName,
	                isWorkspaceItem: metadata.showInAddComponentMenu
	            });
	        });
	    }
	    unregisterComponentFactory(componentFactory) {
	        this.ensureOnDispatchLoop(() => {
	            let metadata = index_1.getComponentFactoryMetadata(componentFactory);
	            core_1.Guard.isDefined(componentFactory, 'componentFactory must be defined');
	            _log.debug(`unregistering component factory with componentFactoryKey [${metadata.componentKey}]`);
	            this._componentFactoriesEntries.delete(metadata.componentKey);
	        });
	    }
	    _onCreateComponent(event) {
	        _log.verbose('Creating component with id {0}', event.componentFactoryKey);
	        this._createComponent(event.componentFactoryKey);
	    }
	    getComponentFactory(componentFactoryKey) {
	        core_1.Guard.isFalse(this._componentFactoriesEntries.has(componentFactoryKey), `component with id [${componentFactoryKey}] already added`);
	        let entry = this._componentFactoriesEntries.get(componentFactoryKey);
	        core_1.Guard.isDefined(entry, `componentFactory with key ${componentFactoryKey} not registered`);
	        return entry.factory;
	    }
	    *_getComponentsMetaData() {
	        for (let entry of this._componentFactoriesEntries.values()) {
	            yield {
	                componentFactoryKey: entry.componentFactoryKey,
	                shortName: entry.shortName,
	                isWorkspaceItem: entry.isWorkspaceItem
	            };
	        }
	    }
	    _createComponent(componentFactoryKey) {
	        this._ensureComponentRegistered(componentFactoryKey);
	        let entry = this._componentFactoriesEntries.get(componentFactoryKey);
	        entry.factory.createComponent();
	    }
	    _ensureComponentRegistered(componentFactoryKey) {
	        core_1.Guard.isTrue(this._componentFactoriesEntries.has(componentFactoryKey), `component with id [${componentFactoryKey}] not registered`);
	    }
	}
	__decorate([
	    esp_js_1.observeEvent('createComponent'),
	    __metadata("design:type", Function),
	    __metadata("design:paramtypes", [Object]),
	    __metadata("design:returntype", void 0)
	], ComponentRegistryModel.prototype, "_onCreateComponent", null);
	exports.default = ComponentRegistryModel;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var literalResolver_1 = __webpack_require__(34);
	exports.LiteralResolver = literalResolver_1.default;


/***/ },
/* 34 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	class LiteralResolver {
	    resolve(container, dependencyKey) {
	        return dependencyKey.value;
	    }
	}
	exports.default = LiteralResolver;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(__webpack_require__(24));
	__export(__webpack_require__(37));
	__export(__webpack_require__(50));
	__export(__webpack_require__(33));
	var viewBase_1 = __webpack_require__(7);
	exports.ViewBase = viewBase_1.default;
	var layoutMode_1 = __webpack_require__(36);
	exports.LayoutMode = layoutMode_1.default;
	var modelBase_1 = __webpack_require__(11);
	exports.ModelBase = modelBase_1.default;


/***/ },
/* 36 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	class LayoutMode {
	    constructor(status) {
	        this._name = status;
	    }
	    static get desktop() {
	        return LayoutMode._desktop;
	    }
	    static get tabletDetached() {
	        return LayoutMode._tabletDetached;
	    }
	    static get tabletAttached() {
	        return LayoutMode._tabledAttached;
	    }
	    static get values() {
	        return [LayoutMode.desktop, LayoutMode.tabletDetached, LayoutMode.tabletAttached];
	    }
	    get name() {
	        return this._name;
	    }
	}
	LayoutMode._desktop = new LayoutMode('desktop');
	LayoutMode._tabletDetached = new LayoutMode('tabletDetached');
	LayoutMode._tabledAttached = new LayoutMode('tabledAttached');
	exports.default = LayoutMode;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	var regionItem_1 = __webpack_require__(13);
	exports.RegionItem = regionItem_1.default;
	var regionModelBase_1 = __webpack_require__(14);
	exports.RegionModelBase = regionModelBase_1.default;
	var regionManager_1 = __webpack_require__(44);
	exports.RegionManager = regionManager_1.default;
	__export(__webpack_require__(45));
	__export(__webpack_require__(38));


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(__webpack_require__(39));
	__export(__webpack_require__(41));


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(__webpack_require__(25));
	var multiTileRegionModel_1 = __webpack_require__(40);
	exports.MultiTileRegionModel = multiTileRegionModel_1.default;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const esp_js_1 = __webpack_require__(8);
	const regionItem_1 = __webpack_require__(13);
	const regionModelBase_1 = __webpack_require__(14);
	const multiTileRegionEventConst_1 = __webpack_require__(26);
	class MultiTileRegionModel extends regionModelBase_1.default {
	    constructor(regionName, router, regionManager) {
	        super(regionName, router, regionManager);
	        this.tileItems = [];
	    }
	    _observeSelectedTileChanged(ev) {
	        this.selectedItem = ev.selectedItem;
	    }
	    _addToRegion(title, modelId, displayContext) {
	        this.tileItems.push(new regionItem_1.default(title, modelId, displayContext));
	    }
	    _removeFromRegion(modelId, displayContext) {
	        for (let i = this.tileItems.length; i--;) {
	            let item = this.tileItems[i];
	            if (item === this.selectedItem) {
	                this.selectedItem = null;
	            }
	            if (item.equals(modelId, displayContext)) {
	                this.tileItems.splice(i, 1);
	                break;
	            }
	        }
	        if (!this.selectedItem && this.tileItems.length > 0) {
	            this.selectedItem = this.tileItems[0];
	        }
	    }
	}
	__decorate([
	    esp_js_1.observeEvent(multiTileRegionEventConst_1.default.selectedTileChanged),
	    __metadata("design:type", Function),
	    __metadata("design:paramtypes", [Object]),
	    __metadata("design:returntype", void 0)
	], MultiTileRegionModel.prototype, "_observeSelectedTileChanged", null);
	exports.default = MultiTileRegionModel;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var tileItemView_1 = __webpack_require__(12);
	exports.TileItemView = tileItemView_1.default;
	var multiTileRegionView_1 = __webpack_require__(42);
	exports.MultiTileRegionView = multiTileRegionView_1.default;
	var selectableMultiTileView_1 = __webpack_require__(43);
	exports.SelectableMultiTileView = selectableMultiTileView_1.default;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const esp_js_react_1 = __webpack_require__(16);
	const _ = __webpack_require__(30);
	const React = __webpack_require__(5);
	const classnames = __webpack_require__(15);
	const core_1 = __webpack_require__(1);
	const tileItemView_1 = __webpack_require__(12);
	const viewBase_1 = __webpack_require__(7);
	const _log = core_1.Logger.create('MultiTileRegionView');
	class MultiTileRegionView extends viewBase_1.default {
	    render() {
	        _log.verbose('Rendering');
	        let model = this.props.model;
	        if (!model) {
	            return null;
	        }
	        if (model.tileItems.length === 0) {
	            // if there are no items we don't want to spit out any html which may affect layout
	            return null;
	        }
	        let items = _.map(model.tileItems, (regionItem) => {
	            _log.verbose(`Adding view for model [${regionItem.modelId}] with key [${regionItem.itemKey}]`);
	            return (React.createElement(tileItemView_1.default, { key: regionItem.itemKey },
	                React.createElement(esp_js_react_1.SmartComponent, { modelId: regionItem.modelId, viewContext: regionItem.displayContext })));
	        });
	        let className = classnames(this.props.className, 'multi-tile-container');
	        return (React.createElement("div", { className: className }, items));
	    }
	}
	exports.default = MultiTileRegionView;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const React = __webpack_require__(5);
	const esp_js_react_1 = __webpack_require__(16);
	const classnames = __webpack_require__(15);
	const core_1 = __webpack_require__(1);
	const viewBase_1 = __webpack_require__(7);
	const tileItemView_1 = __webpack_require__(12);
	const events_1 = __webpack_require__(25);
	const _log = core_1.Logger.create('MultiTileRegionView');
	class SelectableMultiTileView extends viewBase_1.default {
	    _onItemClicked(item) {
	        let ev = { selectedItem: item };
	        this.props.router.publishEvent(this.props.model.modelId, events_1.MultiTileRegionEventConst.selectedTileChanged, ev);
	    }
	    render() {
	        _log.verbose('Rendering');
	        let model = this.props.model;
	        if (!model) {
	            return null;
	        }
	        if (model.tileItems.length === 0) {
	            // if there are no items we don't want to spit out any html which may affect layout
	            return null;
	        }
	        let selectedItem = model.selectedItem;
	        if (!selectedItem) {
	            selectedItem = model.tileItems[0];
	        }
	        let header = null;
	        if (model.tileItems.length > 1) {
	            let headerButtons = model.tileItems.map((tileItem) => {
	                let className = classnames({
	                    'item-header': true,
	                    'is-selected': tileItem === model.selectedItem
	                });
	                return (React.createElement("div", { onClick: () => this._onItemClicked(tileItem), key: tileItem.itemKey, className: className }, tileItem.title));
	            });
	            header = (React.createElement("div", { className: 'item-header-container' }, headerButtons));
	        }
	        let grids = model.tileItems.map((tileItem) => {
	            if (tileItem === selectedItem) {
	                return (React.createElement(tileItemView_1.default, { key: tileItem.itemKey, className: 'single-tile-view-container' },
	                    React.createElement(esp_js_react_1.SmartComponent, { modelId: tileItem.modelId, viewContext: tileItem.displayContext })));
	            }
	            else {
	                return null;
	            }
	        });
	        let classNames = classnames(this.props.className, 'selectable-multi-tile-container');
	        return (React.createElement("div", { className: classNames },
	            header,
	            grids));
	    }
	}
	exports.default = SelectableMultiTileView;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const core_1 = __webpack_require__(1);
	const _log = core_1.Logger.create('RegionManager');
	// exists to decouple all the region and their models from the rest of the app
	class RegionManager {
	    constructor() {
	        this._regions = {};
	    }
	    // adds a region to the region manager, should be (viewKey, modelId) => {}
	    registerRegion(regionName, onAddingViewToRegionCallback, onRemovingFromRegionCallback) {
	        core_1.Guard.isString(regionName, 'region name required');
	        core_1.Guard.isFunction(onAddingViewToRegionCallback, 'onAddingViewToRegionCallback must be a function');
	        core_1.Guard.isFunction(onRemovingFromRegionCallback, 'onRemovingFromRegionCallback must be a function');
	        _log.debug('registering region {0}', regionName);
	        if (this._regions[regionName]) {
	            throw new Error('Region ' + regionName + ' already registered');
	        }
	        this._regions[regionName] = {
	            onAdding: onAddingViewToRegionCallback,
	            onRemoving: onRemovingFromRegionCallback
	        };
	    }
	    unregisterRegion(regionName) {
	        _log.debug('unregistering region {0}', regionName);
	        delete this._regions[regionName];
	    }
	    // adds a model to be displayed in a region, uses annotations to find view
	    addToRegion(regionName, model, displayContext) {
	        core_1.Guard.isString(regionName, 'region name required');
	        core_1.Guard.isDefined(model, 'model must be defined');
	        _log.debug(`Adding model with id ${model.modelId} (display context:'${displayContext || 'n/a'}') to region ${regionName}`);
	        if (!this._regions[regionName]) {
	            throw new Error('Region ' + regionName + ' not registered');
	        }
	        this._regions[regionName].onAdding(model, displayContext);
	    }
	    removeFromRegion(regionName, model, displayContext) {
	        core_1.Guard.isString(regionName, 'region name required');
	        core_1.Guard.isDefined(model, 'model must be defined');
	        _log.debug(`Removing model with id ${model.modelId} (display context:'${displayContext || 'n/a'}') from region ${regionName}`);
	        if (!this._regions[regionName]) {
	            throw new Error('Region ' + regionName + ' not registered');
	        }
	        this._regions[regionName].onRemoving(model, displayContext);
	    }
	}
	exports.default = RegionManager;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(__webpack_require__(46));
	__export(__webpack_require__(48));


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var singleItemRegionsModel_1 = __webpack_require__(47);
	exports.SingleItemRegionsModel = singleItemRegionsModel_1.default;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const regionItem_1 = __webpack_require__(13);
	const regionModelBase_1 = __webpack_require__(14);
	class SingleItemRegionsModel extends regionModelBase_1.default {
	    constructor(regionName, router, regionManager) {
	        super(regionName, router, regionManager);
	        this.item = null;
	    }
	    _addToRegion(title, modelId, displayContext) {
	        this.item = new regionItem_1.default(title, modelId, displayContext);
	    }
	    _removeFromRegion(modelId, displayContext) {
	        this.item = null;
	    }
	}
	exports.default = SingleItemRegionsModel;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var singleItemRegionView_1 = __webpack_require__(49);
	exports.SingleItemRegionView = singleItemRegionView_1.default;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const esp_js_react_1 = __webpack_require__(16);
	const React = __webpack_require__(5);
	const classnames = __webpack_require__(15);
	const core_1 = __webpack_require__(1);
	const viewBase_1 = __webpack_require__(7);
	const _log = core_1.Logger.create('SingleItemRegionView');
	class SingleItemRegionView extends viewBase_1.default {
	    render() {
	        _log.verbose('Rendering');
	        let model = this.props.model;
	        if (!model) {
	            return null;
	        }
	        if (model.item) {
	            let className = classnames(this.props.className, 'single-item-container');
	            return (React.createElement("div", { className: className },
	                React.createElement(esp_js_react_1.SmartComponent, { modelId: model.item.modelId, viewContext: model.item.displayContext })));
	        }
	        else {
	            // if there is no item we don't want to spit out any html which may affect layout
	            return null;
	        }
	    }
	}
	exports.default = SingleItemRegionView;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var stateService_1 = __webpack_require__(51);
	exports.StateService = stateService_1.default;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	const core_1 = __webpack_require__(1);
	const _log = core_1.Logger.create('StateService');
	class StateService {
	    saveApplicationState(moduleKey, layoutMode, state) {
	        core_1.Guard.isString(moduleKey, 'appKey must be a string');
	        core_1.Guard.isDefined(layoutMode, 'layoutMode must be a defined');
	        core_1.Guard.isDefined(state, 'state must be a defined');
	        let stateJson = JSON.stringify(state);
	        let stateKey = this._getStateKey(moduleKey, layoutMode);
	        _log.debug(`saving layout state for key ${stateKey}. State:${stateJson}`, state);
	        localStorage.setItem(stateKey, stateJson);
	    }
	    getApplicationState(moduleKey, layoutMode) {
	        core_1.Guard.isString(moduleKey, 'moduleKey must be a string');
	        core_1.Guard.isDefined(layoutMode, 'layoutMode must be a defined');
	        let stateKey = this._getStateKey(moduleKey, layoutMode);
	        let state = localStorage.getItem(stateKey);
	        return state ? JSON.parse(state) : null;
	    }
	    _getStateKey(appKey, layoutMode) {
	        return `${appKey}-${layoutMode.name}`;
	    }
	}
	exports.default = StateService;


/***/ }
/******/ ]);