import ModelBase from './ModelBase';

/**
 * A base class for the root model entity.
 *
 * You don't need to derive from this to use the router, provided as a convenience
 */
class ModelRootBase extends ModelBase {
    constructor() {
        super();
        this._isLocked = true;
        this._checkIsLocked = (function(){
            return this._isLocked;
        }).bind(this);
    }
    lock() {
        this._isLocked = true;
    }
    unlock() {
        this._isLocked = false;
    }
    bindLockPredicate() {
        this._bindLockPredicate(this);
    }
    _bindLockPredicate(parent) {
        parent = parent || this;
        for (var key in parent) {
            if(parent.hasOwnProperty(key)) {
                var o = parent[key];
                if (o instanceof ModelBase) {
                    o._checkIsLocked = this._checkIsLocked;
                    this._bindLockPredicate(o);
                }
            }
        }
    }
}

export default ModelRootBase;
