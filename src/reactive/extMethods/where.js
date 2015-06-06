import Observable from '../Observable';
import { Guard } from '../../system';

Observable.prototype.where = function(predicate) {
    Guard.isDefined(predicate, 'predicate Required');
    var source = this;
    var observe =  observer => {
        return source.observe(
            (arg1, arg2, arg3) => {
                if(predicate(arg1, arg2, arg3)) {
                    observer.onNext(arg1, arg2, arg3);
                }
            },
            observer.onError.bind(observer),
            () => observer.onCompleted()
        );
    };
    return new Observable(observe, this._router);
};
