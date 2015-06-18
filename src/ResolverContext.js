/*
 * Copyright 2015 Keith Woods
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as utils from './utils.js';

// helper to track circular dependencies during a resolve call
export default class ResolverContext  {
    constructor() {
        this._isResolving = false;
        this._resolutionChain = [];
        this._hasEnded = false;
    }
    beginResolve(key) {
        var self = this;
        if(self._resolutionChain.indexOf(key) !== -1) {
            var resolutionChainSummary = self._resolutionChain[0];
            for (var i = 1; i < self._resolutionChain.length;  i++) {
                resolutionChainSummary += ' -required-> ' + self._resolutionChain[i];
            }
            resolutionChainSummary += ' -required-> ' + key;
            throw new Error(utils.sprintf('Circular dependency detected when resolving item by name \'%s\'.\r\nThe resolution chain was:\r\n%s', key, resolutionChainSummary));
        }
        if(!this._isResolving) {
            this._isResolving = true;
        }
        self._resolutionChain.push(key);
        return {
            endResolve: function () {
                if(!this._hasEnded) {
                    this._hasEnded = true;
                    var i = self._resolutionChain.indexOf(key);
                    if (i > -1) {
                        self._resolutionChain.splice(i, 1);
                    }
                    if (self._resolutionChain.length === 0) {
                        self._isResolving = false;
                    }
                }
            }
        };
    }
}