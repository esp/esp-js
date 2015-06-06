import Observable from '../Observable';
import { Guard } from '../../system';

// TODO beta, needs test
Observable.prototype.do = function(action) {
    Guard.isFunction(action, "provided value isn't a function");
    var source = this;
    var observe =  observer => {
        return source.observe(
            (arg1, arg2, arg3) => {
                action(arg1, arg2, arg3);
                observer.onNext(arg1, arg2, arg3);
            },
            observer.onError.bind(observer),
            () => observer.onCompleted()
        );
    };
    return new Observable(observe, this._router);
};
