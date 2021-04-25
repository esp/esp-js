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

export namespace utils {
    export function removeAll<T>(arr: T[], item: T) {
        for (let i = arr.length; i--;) {
            if (arr[i] === item) {
                arr.splice(i, 1);
            }
        }
    }

    export function isString(value: any): boolean {
        return typeof value === 'string' || value instanceof String;
    }

    export function isFunction(value: any): boolean {
        return typeof (value) === 'function';
    }

    export function startsWith(string: string, searchString: string, position: number = 0): boolean {
        return string.indexOf(searchString, position) === position;
    }

    export function getPropertyNames(object: any): string[] {
        let props = [];
        Object.getOwnPropertyNames(object).forEach(function (key) {
            props.push(key);
        });
        let proto = Object.getPrototypeOf(object);
        if (proto !== null && typeof proto === 'object') {
            let childProps = getPropertyNames(proto);
            for (let i = 0; i < childProps.length; i++) {
                props.push(childProps[i]);
            }
        }
        return props;
    }

    export const isObject = (value: any): value is object => {
        return typeof value === 'object' && value !== null;
    };
}