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

import Guard from '../Guard';
import level from './level';
import defaultSink from './defaultSink';

let _currentLevel = level.debug;
let _sink = defaultSink;

export default class Logger {
    constructor(name) {
        this._name = name;
    }

    static create(name) {
        Guard.isDefined(name, "The name argument should be defined");
        Guard.isString(name, "The name argument should be a string");
        return new Logger(name);
    }

    static setLevel(level) {
        _currentLevel = level;
    }

    static setSink(sink) {
        Guard.isFunction(sink, "Logging sink argument must be a function");
        _sink = sink;
    }

    verbose(format) {
        if (_currentLevel <= level.verbose) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._log("VERBOSE", format, args);
        }
    }

    debug(format) {
        if (_currentLevel <= level.debug) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._log("DEBUG", format, args);
        }
    }

    info(format) {
        if (_currentLevel <= level.info) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._log("INFO", format, args);
        }
    }

    warn(format) {
        if (_currentLevel <= level.warn) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._log("WARN", format, args);
        }
    }

    error(format) {
        if (_currentLevel <= level.error) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._log("ERROR", format, args);
        }
    }

    _log(level, format, args) {
        Guard.isString(format, "First argument to a log function should be a string, but got [" + format + "]");
        var message = format.replace(/{(\d+)}/g, (match, number) => {
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