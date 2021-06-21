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

import {DisposableWrapper} from '../../../src/system/disposables';

describe('DisposableWrapper', () => {

    it('should accept functions as disposables', () => {
        let isDisposed = false;
        let disposable = function () {
            isDisposed = true;
        };
        let disposableWrapper = new DisposableWrapper(disposable);
        disposableWrapper.dispose();
        expect(isDisposed).toEqual(true);
    });

    it('should accept objects with a dispose methods as disposables', () => {
        let disposable = {
            isDisposed: false,
            dispose: function () {
                this.isDisposed = true;
            }
        };
        let disposableWrapper = new DisposableWrapper(disposable);
        disposableWrapper.dispose();
        expect(disposable.isDisposed).toEqual(true);
    });

    it('should accept objects with an unsubscribe method as disposables', () => {
        let subscriptionLikeThing = {
            closed: false,
            unsubscribe: function () {
                this.closed = true;
            }
        };
        let disposableWrapper = new DisposableWrapper(subscriptionLikeThing);
        disposableWrapper.dispose();
        expect(subscriptionLikeThing.closed).toEqual(true);
    });

    it('should only dispose instances once', () => { // bit of a void test
        let disposeCount = 0;
        let disposable = new DisposableWrapper(() => {
            disposeCount++;
        });
        disposable.dispose();
        disposable.dispose();
        expect(disposeCount).toEqual(1);
    });

    it('should throw if undefined passed to ctor', () => {
        expect(() => new DisposableWrapper(undefined)).toThrow();
    });

    it('should throw if null passed to ctor', () => {
        expect(() => new DisposableWrapper(null)).toThrow();
    });

    it('should throw if string passed to ctor', () => {
        expect(() => new DisposableWrapper(<any>'boo')).toThrow();
    });
});