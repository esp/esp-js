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

export function removeAll(arr, item) {
    for(var i = arr.length; i--;) {
        if(arr[i] === item) {
            arr.splice(i, 1);
        }
    }
}

export function isString(value) {
    return typeof value == 'string' || value instanceof String;
}

export function format(formatString) {
    //Guard.isString(format, "First argument to a log function should be a string, but got [" + format + "]");
    var args = Array.prototype.slice.call(arguments, 1);
    var message = formatString.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
    return message;
}

export function startsWith(string, searchString, position) {
    position = position || 0;
    return string.indexOf(searchString, position) === position;
}

export function getPropertyNames(object) {
    var props = [];
    Object.getOwnPropertyNames(object).forEach( function( key ){
        props.push(key);
    });
    var proto = Object.getPrototypeOf(object);
    if(proto !== null && typeof proto === 'object') {
        var childProps = getPropertyNames(proto);
        for (var i = 0; i < childProps.length; i++) {
            props.push(childProps[i]);
        }
    }
    return props;
}