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

import {utils} from './utils';

export class Guard {
    public static isDefined(value: any, message: string): void {
        if (typeof value === 'undefined' || value === null) {
            doThrow(message);
        }
    }
    public static isTruthy(check: boolean, message: string): void {
        if (!check) {
            doThrow(message);
        }
    }
    public static isFalsey(value: any, message: string): void {
        if (value) {
            doThrow(message);
        }
    }
    public static lengthIs(array: any[], length: number, message: string): void {
        if (array.length !== length) {
            doThrow(message);
        }
    }
    public static lengthGreaterThan(array: any[], length: number, message: string): void {
        if (array.length < length) {
            doThrow(message);
        }
    }
    public static lengthIsAtLeast(array: any[], length: number, message: string): void {
        if (array.length < length) {
            doThrow(message);
        }
    }
    public static stringIsNotEmpty(value: any, message: string): void {
        if (!utils.isString(value) || value.trim() === '') {
            doThrow(message);
        }
    }
    public static isString(value: any, message: string): void {
        if (!utils.isString(value)) {
            doThrow(message);
        }
    }
    public static isFunction(item: any, message: string): void {
        if (!utils.isFunction(item)) {
            doThrow(message);
        }
    }
    public static isNumber(value: any, message: string): void {
        if (isNaN(value)) {
            doThrow(message);
        }
    }
    public static isObject(value: any, message: string): void {
        if(typeof value !== 'object' || value === null) {
            doThrow(message);
        }
    }

    public static isBoolean(value: any, message: string): void {
        if (typeof(value) !== 'boolean') {
            doThrow(message);
        }
    }

    public static isArray(value: any, message: string): void {
        if (!Array.isArray(value)) {
            doThrow(message);
        }
    }
}

function doThrow(message: string) {
    if(typeof message === 'undefined' || message === '') {
        throw new Error('Argument error');
    }
    throw new Error(message);
}