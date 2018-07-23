// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
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

import {Guard} from '../guard';
import {Level} from './level';
import {consoleSink} from './consoleSink';
import {Sink} from './sink';

let _currentLevel = Level.debug;
let _sink = consoleSink;

export class Logger {
    public constructor(private _name) {
    }

    public static create(name): Logger {
        Guard.isDefined(name, 'The name argument should be defined');
        Guard.isString(name, 'The name argument should be a string');
        return new Logger(name);
    }

    public static setLevel(level: Level): void {
        _currentLevel = level;
    }

    public static setSink(sink: Sink): void {
        Guard.isFunction(sink, 'Logging sink argument must be a function');
        _sink = sink;
    }

    public verbose(message: string, ...args: any[]): void {
        if (_currentLevel <= Level.verbose) {
            args = Array.prototype.slice.call(arguments, 1);
            this._log('VERBOSE', message, args);
        }
    }

    public debug(message: string, ...args: any[]): void {
        if (_currentLevel <= Level.debug) {
            args = Array.prototype.slice.call(arguments, 1);
            this._log('DEBUG', message, args);
        }
    }

    public info(message: string, ...args: any[]): void {
        if (_currentLevel <= Level.info) {
            args = Array.prototype.slice.call(arguments, 1);
            this._log('INFO', message, args);
        }
    }

    public warn(message: string, ...args: any[]): void {
        if (_currentLevel <= Level.warn) {
            args = Array.prototype.slice.call(arguments, 1);
            this._log('WARN', message, args);
        }
    }

    public error(message: string, ...args: any[]): void {
        if (_currentLevel <= Level.error) {
            args = Array.prototype.slice.call(arguments, 1);
            this._log('ERROR', message, args);
        }
    }

    private _log(level, message: string, args: any[]): void {
        Guard.isString(message, 'First argument to a log function should be a string, but got [' + message + ']');
        _sink({
            logger: this._name,
            level: level,
            message: message,
            args: args
        });
    }
}