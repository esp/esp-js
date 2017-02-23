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

import esp from '../../src';

describe('Router', () => {

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('lock/unlock', () => {
        let _model,
            _modelWasLockedForChangeDispatch = false;

        beforeEach(() => {
            _model = {
                isLocked: true, // default state
                isUnlockedForPreEventProcessor: false,
                isUnlockedForEventProcessor: false,
                isUnlockedForPostEventProcessor: false,
                unlock() {
                    this.isLocked = false;
                },
                lock() {
                    this.isLocked = true;
                }
            };
            _modelWasLockedForChangeDispatch = false;
            _router.addModel(
                'modelId1',
                _model,
                {
                    preEventProcessor: (model) => {
                        model.isUnlockedForPreEventProcessor = !model.isLocked;
                    },
                    postEventProcessor: (model) => {
                        model.isUnlockedForPostEventProcessor = !model.isLocked;
                    }
                }
            );
            _router.getEventObservable('modelId1', 'Event1').subscribe((event, context, model) => {
                model.isUnlockedForEventProcessor = !model.isLocked;
            });
            _router.getModelObservable('modelId1').subscribe((model) => {
                _modelWasLockedForChangeDispatch = model.isLocked;
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
        });

        it('should unlock the model for pre event processing', () => {
            expect(_model.isUnlockedForPreEventProcessor).toEqual(true);
        });

        it('should unlock the model for event processor processing', () => {
            expect(_model.isUnlockedForEventProcessor ).toEqual(true);
        });

        it('should unlock the model for post event processing', () => {
            expect(_model.isUnlockedForPostEventProcessor).toEqual(true);
        });

        it('should lock the model for change notification dispatch', () => {
            expect(_modelWasLockedForChangeDispatch).toEqual(true);
        });
    });
});