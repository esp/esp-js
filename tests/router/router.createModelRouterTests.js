// notice_start
/*
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
 */
// notice_end

import esp from '../../src/index';

describe('Router', () => {

    var _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.createModelRouter()', () => {
        var _model, _modelRouter, _dispatchedModelNumbers;

        beforeEach(() => {
            _model = {
                id:'theModel',
                aNumber:0,
                anotherNumber:0,
                executePassed: false
            };
            _dispatchedModelNumbers = [];
            _router.registerModel(_model.id, _model);
            _modelRouter = _router.createModelRouter(_model.id);
            _modelRouter.getEventObservable('fooEvent').observe((e, c, m) => {
                m.aNumber = e;
            });
            _modelRouter.getModelObservable().observe(m => {
                _dispatchedModelNumbers.push(m.aNumber);
            });
            _modelRouter.publishEvent('fooEvent', 1);
        });

        it('should proxy publishEvent and getEventObservable', ()=> {
            expect(_model.aNumber).toEqual(1);
        });

        it('should proxy executeEvent to correct model event processor', ()=> {
            _modelRouter.getEventObservable('barEvent').observe((e, c, m) => {
                m.executePassed = m.anotherNumber === 0;
            });
            _modelRouter.getEventObservable('fooEvent2').observe((e, c, m) => {
                _modelRouter.executeEvent('barEvent', 'theBar');
                m.anotherNumber = 1;
            });
            _modelRouter.publishEvent('fooEvent2', {});
            expect(_model.executePassed).toEqual(true);
        });

        it('should proxy getModelObservable to correct models change stream', ()=> {
            expect(_dispatchedModelNumbers.length).toEqual(2);
            expect(_dispatchedModelNumbers[0]).toEqual(0);
            expect(_dispatchedModelNumbers[1]).toEqual(1);
        });
    });
});