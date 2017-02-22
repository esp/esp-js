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

    verbose(message) {
        if (_currentLevel <= level.verbose) {
            let args = Array.prototype.slice.call(arguments, 1);
            this._log("VERBOSE", message, args);
        }
    }

    debug(message) {
        if (_currentLevel <= level.debug) {
            let args = Array.prototype.slice.call(arguments, 1);
            this._log("DEBUG", message, args);
        }
    }

    info(message) {
        if (_currentLevel <= level.info) {
            let args = Array.prototype.slice.call(arguments, 1);
            this._log("INFO", message, args);
        }
    }

    warn(message) {
        if (_currentLevel <= level.warn) {
            let args = Array.prototype.slice.call(arguments, 1);
            this._log("WARN", message, args);
        }
    }

    error(message) {
        if (_currentLevel <= level.error) {
            let args = Array.prototype.slice.call(arguments, 1);
            this._log("ERROR", message, args);
        }
    }

    _log(level, message, args) {
        Guard.isString(message, "First argument to a log function should be a string, but got [" + message + "]");
        _sink({
            logger: this._name,
            level: level,
            message: message,
            args: args
        });
    }
}