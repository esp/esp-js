import {Observable, Subscription} from 'rxjs-compat';
import {Router} from 'esp-js';
import {EspRouterObservable, liftToEspObservable} from 'esp-js-rx';

const subscribeWithRouter = function <T, TModel>(
    this: Observable<T>,
    router: Router,
    modelId: string,
    onNext?: (value: T, model: TModel) => void,
    onError?: (exception: any) => void,
    onCompleted?: () => void): Subscription {
    let observable = <EspRouterObservable<T, TModel>>this.pipe(
        liftToEspObservable(router, modelId)
    );
    return observable.subscribe(
          i => onNext && onNext(i.value, i.model),
        err => onError && onError(err),
        () => onCompleted && onCompleted(),
    );
};

(Observable as any).prototype.subscribeWithRouter = subscribeWithRouter;