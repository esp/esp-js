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

describe('Router', () => {

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.createModelRouter()', () => {
        let _modelRouter, _dispatchedModelNumbers;

        interface TestModel {
            id: string;
            aNumber: number;
            anotherNumber: number;
            executePassed: boolean;
        }

        beforeEach(() => {
            const initialModel: TestModel = {
                id: 'theModel',
                aNumber: 0,
                anotherNumber: 0,
                executePassed: false
            };
            _dispatchedModelNumbers = [];
            new ModelBuilder<TestModel>(_router, initialModel.id, initialModel)
                .withEventHandler<number>('fooEvent', (draft, event) => { draft.aNumber = event; })
                .withEventHandler<any>('fooEvent2', (draft) => { /* noop, barEvent handler will run via executeEvent */ })
                .withEventHandler<any>('barEvent', (draft) => {
                    draft.executePassed = draft.anotherNumber === 0;
                    draft.anotherNumber = 1;
                })
                .registerWithRouter();
            _modelRouter = _router.createModelRouter(initialModel.id);
            _modelRouter.getModelObservable().subscribe(m => {
                _dispatchedModelNumbers.push(m.aNumber);
            });
            _modelRouter.publishEvent('fooEvent', 1);
        });

        it('should proxy publishEvent and getEventObservable', ()=> {
            // fooEvent handler set aNumber to 1 via immer draft
            // model observable emits after each dispatch cycle
            const lastDispatched = _dispatchedModelNumbers[_dispatchedModelNumbers.length - 1];
            expect(lastDispatched).toEqual(1);
        });

        it('should proxy executeEvent to correct model event processor', ()=> {
            _modelRouter.getEventObservable('fooEvent2').subscribe(({event, context, model}: any) => {
                _modelRouter.executeEvent('barEvent', 'theBar');
            });
            _modelRouter.publishEvent('fooEvent2', {});
            // barEvent sets executePassed = (anotherNumber === 0) then anotherNumber = 1
            // final model is accessed via getModelObservable last emission
            const lastModel = _dispatchedModelNumbers.length;
            expect(lastModel).toBeGreaterThan(0);
            // access the model directly from the router to check executePassed
            const model = (_router as any)._models.get('theModel').model;
            expect(model.executePassed).toEqual(true);
        });

        it('should proxy getModelObservable to correct models change stream', ()=> {
            expect(_dispatchedModelNumbers.length).toBeGreaterThan(0);
            const lastDispatched = _dispatchedModelNumbers[_dispatchedModelNumbers.length - 1];
            expect(lastDispatched).toEqual(1);
        });
    });
});
