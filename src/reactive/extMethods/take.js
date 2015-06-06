import Observable from '../Observable';
import { Guard } from '../../system';

// TODO beta, needs test
Observable.prototype.take = function(number) {
    Guard.isNumber(number, "provided value isn't a number");
    var source = this;
    var itemsReceived = 0;
    var hasCompleted = false;
    var observe =  observer => {
        return source.observe(
            (arg1, arg2, arg3) => {
                // there is possibly some strange edge cases if the observer also pumps a new value, this 'should' cover that (no tests yet)
                itemsReceived++;
                var shouldYield = !number || itemsReceived <= number;
                if(shouldYield) {
                    observer.onNext(arg1, arg2, arg3);
                }
                var shouldComplete = !number || itemsReceived >= number;
                if(!hasCompleted && shouldComplete) {
                    hasCompleted = true;
                    observer.onCompleted();
                }
            },
            observer.onError.bind(observer),
            () => observer.onCompleted()
        );
    };
    return new Observable(observe, this._router);
};
