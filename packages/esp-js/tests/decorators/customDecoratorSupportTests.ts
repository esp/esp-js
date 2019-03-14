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

import { EspMetadata, EspDecoratorUtil }  from '../../src';

function barDecorator(someItem: string) {
    return function (target, name, descriptor) {
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        let customData;
        if (!metadata.hasCustomData('custom-key')) {
            // add custom data to the ctor function
            customData = metadata.addCustomData('custom-key', { items: [] });
        } else {
            // get custom data to the ctor function
            customData = metadata.getCustomData('custom-key');
        }
        customData.items.push(someItem);
        return descriptor;
    };
}

class Foo {
    @barDecorator('f1-data')
    f1() {}
    @barDecorator('f2-data')
    f2() {}
}

describe('custom decorator', () => {
    let foo;

    beforeEach(() => {
        foo = new Foo();
    });

    // this is a bit of a catch all test!
    it('Can get and set custom data via constructor function and object instance', () => {
        // get custom data via an object instance
        let customData = EspDecoratorUtil.getCustomData(foo, 'custom-key');
        expect(customData.items).toBeDefined();
        expect(customData.items.length).toEqual(2);
        expect(customData.items[0]).toEqual('f1-data');
        expect(customData.items[1]).toEqual('f2-data');
    });
});