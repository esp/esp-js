import *  as Utils from './utils';

export class Guard {
    static isDefined(value: any, message: string): void {
        if (typeof value === 'undefined') {
            doThrow(message);
        }
    }

    static isFalse(value: any, message: string): void {
        if (value) {
            doThrow(message);
        }
    }

    static lengthIs<T>(array: Array<T>, expectedLength: number, message: string): void {
        if (array.length !== expectedLength) {
            doThrow(message);
        }
    }

    static lengthGreaterThan<T>(array: Array<T>, expectedLength: number, message: string): void {
        if (array.length < expectedLength) {
            doThrow(message);
        }
    }

    static lengthIsAtLeast<T>(array: Array<T>, expectedLength: number, message: string): void {
        if (array.length < expectedLength) {
            doThrow(message);
        }
    }

    static isString(value: any, message: string): void {
        if (!Utils.isString(value)) {
            doThrow(message);
        }
    }

    static stringIsNotEmpty(value: any, message: string): void {
        if (!Utils.isString(value) || value === '') {
            doThrow(message);
        }
    }

    static isTrue(item: any, message: string): void {
        if (!item) {
            doThrow(message);
        }
    }

    static isFunction(value: any, message: string): void {
        if (typeof(value) !== 'function') {
            doThrow(message);
        }
    }

    static isNumber(value: any, message: string): void {
        if (isNaN(value)) {
            doThrow(message);
        }
    }

    static isObject(value: any, message: string): void {
        if (typeof value !== 'object') {
            doThrow(message);
        }
    }

    static isBoolean(value: any, message: string): void {
        if (typeof(value) !== 'boolean') {
            doThrow(message);
        }
    }
}

function doThrow(message: string): never {
    if (typeof message === 'undefined' || message === '') {
        throw new Error('Argument error');
    }
    throw new Error(message);
}
