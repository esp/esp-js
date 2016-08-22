# Reactive API

Both `router.getEventObservable()` and `router.getModelObservable()` return an observable object.
This is modeled on [RxJs's](https://github.com/Reactive-Extensions/RxJS) observable API but with only a few observable methods included, additionally `onError` semantics are not applicable.

> ##### Why not use Rx? <a name="reactive-api-why-not-rx"></a>
>
>The push based model of Rx is ideal for pub/sub scenarios where state needs to be combined from many differing streams.
>However the full Rx API isn't suitable as introduction of asynchronicity and other methods that would result in state being held in observable streams would break the deterministic staged workflow that the `Router` owns.
>For example, a deferred model change by way of an asynchronous operation would happen outside of the state processing workflow.
>Then there is no guarantee the model would be still in a state suitable once the deferred event arrives.
>Similarly, relational operators combine event streams and store state in observable objects/closures, when a final result yields the underlying model may not be in a state suitable for the target result.

## Extending the API

Given the API is modeled on RX, there is nothing stopping you from extending both `EventObservable` and `ModelObservable` to add additional operators.
Internally this is how operators such as `.Where` and `.Select` have been built. For example:

``` js
import Observable from '../Observable';
import { Guard } from '../../system';

Observable.prototype.where = function(predicate) {
    Guard.isDefined(predicate, 'predicate Required');
    var source = this;
    var subscribe =  observer => {
        return source.subscribe(
            (arg1, arg2, arg3) => {
                if(predicate(arg1, arg2, arg3)) {
                    observer.onNext(arg1, arg2, arg3);
                }
            },
            () => observer.onCompleted()
        );
    };
    return new Observable(subscribe);
};
```

Reference:

* [js](https://github.com/esp/esp-js/blob/master/src/reactive/extMethods/where.js)