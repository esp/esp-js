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
    static isNumber(value, message) {
        if (isNaN(value)) {
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