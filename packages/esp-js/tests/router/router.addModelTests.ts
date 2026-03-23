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

import * as esp from '../../src';
import {registerModel} from '../testApi/testHelpers';

describe('Router', () => {

    let _router: esp.Router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.modelBuilder()', () => {
        it('throws if modelId not a string', () => {
            expect(() => { registerModel(_router, undefined, {}); }).toThrow();
            expect(() => { registerModel(_router, <any>{}, {}); }).toThrow();
        });

        it('throws if model is undefined', () => {
            expect(() => { registerModel(_router, 'foo', undefined); }).toThrow();
        });

        it('should throw if model already registered', () => {
            registerModel(_router, 'modelId', {});
            expect(() => { registerModel(_router, 'modelId', {}); }).toThrow(new Error('The model with id [modelId] is already registered'));
        });

        it('ModelBuilder throws if handler undefined', () => {
            expect(() => {
                _router.modelBuilder('modelId', {}).withEventHandler('evt', undefined);
            }).toThrow();
        });

        it('ModelBuilder throws if eventType not a string', () => {
            expect(() => {
                _router.modelBuilder('modelId', {}).withEventHandler(undefined, () => {});
            }).toThrow();
        });
    });
});
