// helper to track circular dependencies during a resolve call
import * as utils from './utils.js';

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