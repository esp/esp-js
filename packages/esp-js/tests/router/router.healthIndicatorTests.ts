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
import {HealthStatus} from '../../src';

describe('Router', () => {

    let _router;
    let _model;

    beforeEach(() => {
        _router = new esp.Router();
    });

    beforeEach(() => {
        _model = {
            throwADispatch: false
        };
        _router.addModel('modelId1', _model, {});
        _router.getEventObservable('modelId1', 'Event1').subscribe(
            ({event, context, model}) => {
                if (model.throwADispatch) {
                    throw new Error('Boom:Dispatch');
                }
            }
        );
    });

    it('is healthy by default', () => {
        expect(_router.health().status).toEqual(HealthStatus.Healthy);
        _router.publishEvent('modelId1', 'Event1', {});
        expect(_router.health().status).toEqual(HealthStatus.Healthy);
    });

    it('when halted is unhealthy', () => {
        _model.throwADispatch = true;
        expect(() => {
            _router.publishEvent('modelId1', 'Event1', {});
        }).toThrow(new Error('Boom:Dispatch'));
        expect(_router.health().status).toEqual(HealthStatus.Terminal);

        expect(() => {
            _router.publishEvent('modelId1', 'Event1', {});
        }).toThrow(new Error('ESP router halted due to previous unhandled error [Error: Boom:Dispatch]'));

        expect(_router.health().status).toEqual(HealthStatus.Terminal);

        expect(_router.health().reasons.length).toEqual(1);
        expect(_router.health().reasons[0]).toEqual('The ESP router has caught an unhandled error and will halt - Error: Boom:Dispatch');
    });
});