import Observable from '../Observable';
import { Guard } from '../../system';

// TODO beta, needs test
Observable.prototype.takeUntil = function(predicate, inclusive) {
    Guard.isFunction(predicate, "provided predicate isn't a function");
    var source = this;
    var done = false;
    var observe =  observer => {
        return source.observe(
            (arg1, arg2, arg3) => {
                if(done) return;
                var shouldTake = predicate(arg1, arg2, arg3);
                if(shouldTake || inclusive) {
                    done = true;
                    observer.onNext(arg1, arg2, arg3);
                    observer.onCompleted();
                }
            },
            observer.onError.bind(observer),
            () => observer.onCompleted()
        );
    };
    return new Observable(observe, this._router);
};
