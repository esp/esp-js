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
 
export function sprintf(format, etc) {
    var arg = arguments;
    var i = 1;
    return format.replace(/%((%)|s)/g, function (m) { return m[2] || arg[i++]; });
}

export function isString(value) {
    return Object.prototype.toString.call(value) === '[object String]';
}

export function isNumber(value) {
    return Object.prototype.toString.call(value) === '[object Number]';
}

export function indexOf(array, item) {
    var iOf;
    if(typeof Array.prototype.indexOf === 'function') {
        iOf = Array.prototype.indexOf;
    } else {
        iOf = function(item) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                if(this[i] === item) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    var index = iOf.call(array, item);
    return index;
}