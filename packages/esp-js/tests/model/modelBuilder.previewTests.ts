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
            _router.modelBuilder<SimpleModel>('model', { value: 0 })
                .withPreviewHandler('AnEvent', (model, event, ctx) => {
                    calls.push('preview');
                })
                .withEventHandler('AnEvent', () => { calls.push('normal'); })
                .build();
            _router.publishEvent('model', 'AnEvent', {});
            expect(calls).toEqual(['preview', 'normal']);
        });

        it('preview handler can cancel the event', () => {
            let normalCalled = false;
            _router.modelBuilder<SimpleModel>('model', { value: 0 })
                .withPreviewHandler('AnEvent', (model, event, ctx) => {
                    ctx.cancel();
                })
                .withEventHandler('AnEvent', () => { normalCalled = true; })
                .build();
            _router.publishEvent('model', 'AnEvent', {});
            expect(normalCalled).toBe(false);
        });

        it('preview handler receives the draft model and can read its values', () => {
            // Preview handlers receive the live immer draft. Do not store the model reference
            // beyond the handler — the draft proxy is revoked after produce completes.
            let receivedValue: number = null;
            let handlerCalled = false;
            _router.modelBuilder<SimpleModel>('model', { value: 42 })
                .withPreviewHandler('AnEvent', (model) => {
                    handlerCalled = true;
                    receivedValue = model.value;
                })
                .build();
            _router.publishEvent('model', 'AnEvent', {});
            expect(handlerCalled).toBe(true);
            expect(receivedValue).toEqual(42);
        });

        it('multiple preview handlers are all called', () => {
            const calls: string[] = [];
            _router.modelBuilder<SimpleModel>('model', { value: 0 })
                .withPreviewHandler('AnEvent', () => { calls.push('preview1'); })
                .withPreviewHandler('AnEvent', () => { calls.push('preview2'); })
                .build();
            _router.publishEvent('model', 'AnEvent', {});
            expect(calls).toEqual(['preview1', 'preview2']);
        });
    });
});
