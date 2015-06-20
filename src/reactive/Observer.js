import { Guard } from '../system';

class Observer {
    constructor(onNext, onError, onCompleted) {
        Guard.isDefined(onNext, 'onObserve Required');
        this._hasError = false;
        this._hasCompleted = false;
        this._onNext = onNext;
        this._onError = (ex) => {
            if(typeof onError === 'undefined' || typeof onError !== 'function') {
                throw ex; // we default to re-throwing if there is no error handler provide
            }
            else {
                onError(ex);
            }
        };
        this._onCompleted = () => {
            if(typeof onCompleted !== 'undefined' && typeof onCompleted === 'function') {
                onCompleted();
            }
        };
    }
    onNext(arg1, arg2, arg3) {
        if(!this._hasError && !this._hasCompleted) {
            this._onNext(arg1, arg2, arg3);
        }
    }
    onError(value) {
        if(!this._hasError) {
            this._hasError = true;
            this._onError(value);
        }
    }
    onCompleted() {
        if(!this._hasCompleted) {
            this._hasCompleted = true;
            this._onCompleted();
        }
    }
}
export default Observer;
