import {Observable} from 'rxjs-compat';
import {Router} from 'esp-js';
import {EspRouterObservable, liftToEspObservable} from 'esp-js-rx';

export function liftToEspObservableCompat<T, TModel>(this: Observable<T>, router: Router, modelId: string): EspRouterObservable<T, TModel> {
    return liftToEspObservable<T, TModel>(router, modelId)(this);
}
(Observable as any).prototype.liftToEspObservable = liftToEspObservableCompat;
declare module 'rxjs/internal/Observable' {
    interface Observable<T> {
        liftToEspObservable: typeof liftToEspObservableCompat;
    }
}