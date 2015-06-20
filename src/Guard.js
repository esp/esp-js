/* notice_start
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
 notice_end */
 
import * as utils from './utils';

export default class Guard {
    static isDefined(value, message) {
        if (typeof value === 'undefined') {
            doThrow(message);
        }
    }
    static isFalsey(value, message) {
        if (value) {
            doThrow(message);
        }
    }
    static lengthIs(array, length, message) {
        if (array.length !== length) {
            doThrow(message);
        }
    }
    static lengthGreaterThan(array, expected, message) {
        if (array.length < expected) {
            doThrow(message);
        }
    }
    static lengthIsAtLeast(array, expected, message) {
        if (array.length < expected) {
            doThrow(message);
        }
    }
    static isString(value, message) {
        if (!utils.isString(value)) {
            doThrow(message);
        }
    }
    static isNumber(value, message) {
        if (!utils.isNumber(value)) {
            doThrow(message);
        }
    }
    static isTrue(check, message) {
        if (!check) {
            doThrow(message);
        }
    }
    static isFunction(item, message) {
        if (typeof(item) != "function") {
            doThrow(message);
        }
    }
    static isObject(value,message) {
        if(typeof value !== 'object') {
            doThrow(message);
        }
    }
}

function doThrow(message) {
    if(typeof message === 'undefined' || message === '') {
        throw new Error("Argument error");
    }
    throw new Error(message);
}