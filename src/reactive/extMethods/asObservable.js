import Observable from '../Observable';

Observable.prototype.asObservable = function() {
    var source = this;
    var observe =  observer => {
        return source.observe(
            (arg1, arg2, arg3) => {
                observer.onNext(arg1, arg2, arg3);
            },
            observer.onError.bind(observer),
            () => observer.onCompleted()
        );
    };
    return new Observable(observe, this._router);
};