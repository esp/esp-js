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

describe('Router', () => {

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.addModel()', () => {
        it('throws if arguments incorrect', () => {
            expect(() => {_router.addModel(undefined, 'foo'); }).toThrow();
            expect(() => {_router.addModel('foo', undefined); }).toThrow();
            expect(() => {_router.addModel('foo', {}, 'not a function'); }).toThrow();
            expect(() => {_router.addModel({ },{ }); }).toThrow(new Error('The modelId argument should be a string'));
            expect(() => {_router.addModel('modelId', { },'notSomeOptions'); }).toThrow(new Error('The eventProcessors argument provided with the model (of id modelId) should be an object'));
            expect(() => {_router.addModel('modelId', { }, { preEventProcessor: {} }); }).toThrow(new Error('preEventProcessor on the model options exists but is not a function'));
            expect(() => {_router.addModel('modelId', { }, { preEventProcessor: 'boo' }); }).toThrow('preEventProcessor on the model options exists but is not a function');
            expect(() => {_router.addModel('modelId', { }, { eventDispatchProcessor: {} }); }).toThrow(new Error('eventDispatchProcessor on the model options exists but is not a function'));
            expect(() => {_router.addModel('modelId', { }, { eventDispatchProcessor: 'boo' }); }).toThrow('eventDispatchProcessor on the model options exists but is not a function');
            expect(() => {_router.addModel('modelId', { }, { eventDispatchedProcessor:{}}); }).toThrow(new Error('eventDispatchedProcessor on the model options exists but is not a function'));
            expect(() => {_router.addModel('modelId', { }, { eventDispatchedProcessor:'boo'}); }).toThrow(new Error('eventDispatchedProcessor on the model options exists but is not a function'));
            expect(() => {_router.addModel('modelId', { }, { postEventProcessor:{}}); }).toThrow(new Error('postEventProcessor on the model options exists but is not a function'));
            expect(() => {_router.addModel('modelId', { }, { postEventProcessor:'boo'}); }).toThrow(new Error('postEventProcessor on the model options exists but is not a function'));
        });

        it('should throw if model already registered', () => {
            _router.addModel('modelId', {});
            expect(() => {_router.addModel('modelId', {}); }).toThrow(new Error('The model with id [modelId] is already registered'));
        });
    });
});