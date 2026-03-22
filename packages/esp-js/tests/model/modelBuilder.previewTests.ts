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
import {ModelBuilder} from '../../src/model/modelBuilder';

interface SimpleModel {
    value: number;
}

describe('ModelBuilder', () => {

    let _router: esp.Router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('preview handlers (withPreviewHandler)', () => {

        it('preview handler is called before event dispatch, normal handler fires after', () => {
            const calls: string[] = [];
            new ModelBuilder<SimpleModel>(_router, 'model', { value: 0 })
                .withPreviewHandler('AnEvent', (model, event, ctx) => {
                    calls.push('preview');
                })
                .withEventHandler('AnEvent', () => { calls.push('normal'); })
                .registerWithRouter();
            _router.publishEvent('model', 'AnEvent', {});
            expect(calls).toEqual(['preview', 'normal']);
        });

        it('preview handler can cancel the event', () => {
            let normalCalled = false;
            new ModelBuilder<SimpleModel>(_router, 'model', { value: 0 })
                .withPreviewHandler('AnEvent', (model, event, ctx) => {
                    ctx.cancel();
                })
                .withEventHandler('AnEvent', () => { normalCalled = true; })
                .registerWithRouter();
            _router.publishEvent('model', 'AnEvent', {});
            expect(normalCalled).toBe(false);
        });

        it('preview handler receives a readonly (frozen) model', () => {
            let receivedModel: Readonly<SimpleModel> = null;
            new ModelBuilder<SimpleModel>(_router, 'model', { value: 42 })
                .withPreviewHandler('AnEvent', (model) => {
                    receivedModel = model;
                })
                .registerWithRouter();
            _router.publishEvent('model', 'AnEvent', {});
            expect(receivedModel).toBeDefined();
            expect(receivedModel.value).toEqual(42);
            expect(() => { (receivedModel as any).value = 99; }).toThrow();
        });

        it('multiple preview handlers are all called', () => {
            const calls: string[] = [];
            new ModelBuilder<SimpleModel>(_router, 'model', { value: 0 })
                .withPreviewHandler('AnEvent', () => { calls.push('preview1'); })
                .withPreviewHandler('AnEvent', () => { calls.push('preview2'); })
                .registerWithRouter();
            _router.publishEvent('model', 'AnEvent', {});
            expect(calls).toEqual(['preview1', 'preview2']);
        });
    });
});
