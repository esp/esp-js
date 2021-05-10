import {Observable} from 'rxjs';
import {Router} from 'esp-js';
import {Guard} from 'esp-js';
import {map, materialize} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {PartialObserver} from 'rxjs';
import {toSubscriber} from 'rxjs/internal-compatibility';

export interface ValueAndModel<T, TModel> {
    value: T;
    model: TModel;
}

export class EspRouterObservable<T, TModel> extends Observable<ValueAndModel<T, TModel>> {
    constructor(private _router: Router, private _modelId: string, private _source: Observable<T>) {
        super();
    }

    // override the underlying subscribe
    subscribe(
        observerOrNext?: PartialObserver<ValueAndModel<T, TModel>> | ((value: ValueAndModel<T, TModel>) => void),
        error?: (error: any) => void,
        complete?: () => void
    ): Subscription {
        const subscriber = toSubscriber(observerOrNext, error, complete);
        return this._source.pipe(materialize()).subscribe(i => {
            switch (i.kind) {
                case 'N':
                    if (observerOrNext !== null && observerOrNext !== undefined) {
                        this._router.runAction<TModel>(
                            this._modelId,
                                (model: TModel) => {
                                    let item = { value: i.value, model: model };
                                    subscriber.next(item);
                            }
                        );
                    }
                    break;
                case 'E':
                    // if there is no error handler, we just blow up, cand dispatch to the model without a handler
                    if (error === null || error === undefined) {
                        throw i.error;
                    } else {
                        this._router.runAction<TModel>(this._modelId, model => subscriber.error(i.error));
                    }
                    break;
                case 'C':
                    if (complete !== null && complete !== undefined) {
                        this._router.runAction<TModel>(this._modelId, model => subscriber.complete());
                    }
                    break;
                default:
                    throw new Error(`Unknown Notification Type. Type was ${i.kind}`);
            }
        });
    }
}

/**
 * Helper method to ease integration between Rx and Esp.
 *
 * When receiving results from an async operation (for example when results yield on an rx stream) you need to notify the esp router that a state change is about to occur for a given model.
 * There are a few ways to do this:
 * 1) publish an esp event in your rx subscription handler, handle the esp event as normal (the publish will have kicked off the the routers dispatch loop).
 * 2) call router.runAction() in your subscription handler and deal with the results inline, again this kicks off the the routers dispatch loop.
 * 3) use runOnEspDispatchLoopWithModel which effectively wraps up method 2 for for all functions of subscribe (onNext, onError, onCompleted).
 *
 * @param router
 * @param modelId : model id for which you want want the dispatch looped invoked for to received the update
 */
export function subscribeOnEspDispatchLoopWithModel<T, TModel>(
    router: Router,
    modelId: string
) : (source: Observable<T>) => EspRouterObservable<T, TModel> {
    Guard.isDefined(router, 'router should be defined');
    Guard.isString(modelId, 'modelId should be defined and a string');
    return (source: Observable<T>) => new EspRouterObservable<T, TModel>(router, modelId, source);
}

/**
 * A variant of runOnEspDispatchLoopWithModel which only yields the change not the model.
 * Typically handy in OO scenarios where the object making the subscription  has local access scope to the model already (or indeed is the model)
 * @param router
 * @param modelId
 */
export function subscribeOnEspDispatchLoop<T>(
    router: Router,
    modelId: string
) : (source: Observable<T>) => Observable<T> {
    Guard.isDefined(router, 'router should be defined');
    Guard.isString(modelId, 'modelId should be defined and a string');
    return (source: Observable<T>) => {
        return new Observable(s => {
            // because EspRouterObservable is overriding the subscribe method, we can't simply do a .pipe(map()) here.
            return new EspRouterObservable<T, any>(router, modelId, source).subscribe(
                value => {
                    s.next(value.value);
                },
                (err) => s.error(err),
                () => s.complete(),
            );
        });
    };
}

/**
 * @deprecated please use runOnEspDispatchLoopWithModel
 */
export const liftToEspObservable = subscribeOnEspDispatchLoopWithModel;