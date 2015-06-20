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

import Guard from './Guard';

var levels = {
    verbose:0,
    debug:1,
    info:2,
    warn:3,
    error:4
};

var _currentLevel = levels.debug;

var _sink = logEvent => {
    console.log('[' + logEvent.logger + '] [' + logEvent.level + ']: ' + logEvent.message);
};

class Logger {
    constructor(name) {
        this._name = name;
    }

    verbose(format) {
        if (_currentLevel <= levels.verbose) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._log("VERBOSE", format, args);
        }
    }

    debug(format) {
        if (_currentLevel <= levels.debug) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._log("DEBUG", format, args);
        }
    }

    info(format) {
        if (_currentLevel <= levels.info) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._log("INFO", format, args);
        }
    }

    warn(format) {
        if (_currentLevel <= levels.warn) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._log("WARN", format, args);
        }
    }

    error(format) {
        if (_currentLevel <= levels.error) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._log("ERROR", format, args);
        }
    }
    _log(level, format, args) {
        Guard.isString(format, "First argument to a log function should be a string, but got [" + format + "]");
        var message = format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match;
        });
        _sink({
            logger: this._name,
            level: level,
            message: message
        });
    }
}

export function create(name) {
    Guard.isDefined(name, "The name argument should be defined");
    Guard.isString(name, "The name argument should be a string");
    return new Logger(name);
}

export function setLevel(level) {
    _currentLevel = level;
}

export function setSink(sink) {
    Guard.isFunction(sink, "Logging sink argument must be a function");
    _sink = sink;
}

export { levels };