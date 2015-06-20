/**
 * A base class for model entities.
 *
 * You don't need to derive from this to use the router, provided as a convenience
 */
class ModelBase {
    constructor() {
        this._checkIsLocked = () => true;
    }
    ensureLocked() {
        if(this._checkIsLocked()) {
            throw new Error("Model is locked, can't edit");
        }
    }
    get isLocked() {
        return this._checkIsLocked();
    }
}
export default ModelBase;