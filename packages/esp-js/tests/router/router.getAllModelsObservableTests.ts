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
import {DispatchType, ModelEnvelope} from '../../src';

describe('Router', () => {

    let _router;
    let _model1, _model2, _model3;
    let _receivedModels: ModelEnvelope<any>[];

    beforeEach(() => {
        _router = new esp.Router();
        _model1 = {};
        _model2 = {};
        _model3 = {};
        _receivedModels = [];
    });

    const addModels = () => {
        _router.addModel('modelId1', _model1);
        _router.addModel('modelId2', _model2);
        _router.addModel('modelId3', _model3);
    };

    const subscribeToUpdates = () => {
        _router.getAllModelsObservable().subscribe((envelope: ModelEnvelope<any>) => {
            _receivedModels.push(envelope);
        });
    };

    const subscribeToEvents = () => {
        _router.getEventObservable('modelId1', 'Event1').subscribe(() => { /*noop*/  });
        _router.getEventObservable('modelId2', 'Event1').subscribe(() => { /*noop*/  });
        _router.getEventObservable('modelId3', 'Event1').subscribe(() => { /*noop*/  });
    };

    const expectUpdateToBe = (index: number, modelId: string, dispatchType: DispatchType, model: any) => {
        expect(_receivedModels[index].modelId).toBe(modelId);
        expect(_receivedModels[index].dispatchType).toBe(dispatchType);
        expect(_receivedModels[index].model).toBe(model);
    };

    describe('.getAllModelsObservable()', () => {
        it('procures when a model added', () => {
            subscribeToUpdates();
            addModels();
            expect(_receivedModels.length).toBe(3);
            expectUpdateToBe(0, 'modelId1', DispatchType.ModelUpdate, _model1);
            expectUpdateToBe(1, 'modelId2', DispatchType.ModelUpdate, _model2);
            expectUpdateToBe(2, 'modelId3', DispatchType.ModelUpdate, _model3);
        });

        it('procures when a model removed', () => {
            addModels();
            subscribeToUpdates();
            expect(_receivedModels.length).toBe(0);
            _router.removeModel('modelId1');
            expect(_receivedModels.length).toBe(1);
            expectUpdateToBe(0, 'modelId1', DispatchType.ModelDelete, undefined);
        });

        it('procures when a model updates', () => {
            addModels();
            subscribeToUpdates();
            subscribeToEvents();

            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(_receivedModels.length).toBe(1);
            expectUpdateToBe(0, 'modelId1', DispatchType.ModelUpdate, _model1);

            _router.publishEvent('modelId2', 'Event1', 'payload');
            expect(_receivedModels.length).toBe(2);
            expectUpdateToBe(1, 'modelId2', DispatchType.ModelUpdate, _model2);

            _router.publishEvent('modelId3', 'Event1', 'payload');
            expect(_receivedModels.length).toBe(3);
            expectUpdateToBe(2, 'modelId3', DispatchType.ModelUpdate, _model3);
        });
    });
});