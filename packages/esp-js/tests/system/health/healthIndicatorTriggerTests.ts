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

import {DefaultHealthIndicatorTrigger} from '../../../src/system';

describe('DefaultHealthIndicatorTrigger', () => {
    let updates = 0;
    let subscription = null;

    beforeAll(() => {
        jest.useFakeTimers();
        jest.spyOn(global, 'setInterval');
    });

    beforeEach(() => {
        jest.clearAllTimers();
        updates = 0;
        subscription = DefaultHealthIndicatorTrigger.trigger.subscribe(() => {
            updates++;
        });
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should use 5000ms as trigger interval', () => {
        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 5000);
    });

    it('should push trigger every 5000ms', () => {
        expect(updates).toEqual(0);

        jest.advanceTimersByTime(5000);
        expect(updates).toEqual(1);

        jest.advanceTimersByTime(5000);
        expect(updates).toEqual(2);

        jest.advanceTimersByTime(5000);
        expect(updates).toEqual(3);
    });

    it('disposing clears timer', () => {
        jest.advanceTimersByTime(5000);
        expect(updates).toEqual(1);

        subscription.dispose();

        jest.advanceTimersByTime(20_000);
        expect(updates).toEqual(1);
    });
});