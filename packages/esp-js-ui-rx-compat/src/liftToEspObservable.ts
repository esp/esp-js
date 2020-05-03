import {Observable} from 'rxjs';
import {Router} from 'esp-js';
import {EspRouterObservable, liftToEspObservable} from 'esp-js-ui';

export function liftToEspObservableCompat<T, TModel>(router: Router, modelId: string): EspRouterObservable<T, TModel> {
    return liftToEspObservable<T, TModel>(router, modelId)(this);
}
(Observable as any).prototype.liftToEspObservable = liftToEspObservableCompat;
declare module 'rxjs/internal/Observable' {
    interface Observable<T> {
        liftToEspObservable: typeof liftToEspObservableCompat;
    }
}