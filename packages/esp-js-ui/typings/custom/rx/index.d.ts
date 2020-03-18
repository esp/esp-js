// import * as Rx from 'rxjs';
// import { Router } from 'esp-js';
import {Scheduler} from 'rxjs/Scheduler';
//
// declare module 'rxjs/Observable' {
//
//     interface Observable<T> {
        doOnSubscribe<T>(action: () => void) : Rx.Observable<T>;
//
//         // I can't find a way of extending ConnectableObservable in TS
        lazyConnect<T>(onConnect:(subscription: Rx.Subscription) => void) : Rx.Observable<T>;
//
        subscribeWithRouter<T, TModel>(
//             router : Router,
//             modelId: string,
//             next?: (value: T, model : TModel) => void,
//             error?: (exception: any, model : TModel) => void,
//             complete?: (model : TModel) => void
//         ) : Rx.Subscription;
//
        retryWithPolicy<T>(policy, onError?:(err:Error) => void, scheduler? : Scheduler) : Rx.Observable<T>;
//
        // this is valid rx but not on rx.all.d.ts
        timeout<TOther>(dueTime: number, other?: Observable<TOther>, scheduler?: Scheduler): Observable<T>;
//
        takeUntilInclusive<T>(predicate: (item: T) => boolean) : Rx.Observable<T>;
//     }
//
//     interface ObservableStatic {
//         prototype: any;
//     }
// }
/*
import * as Rx from 'rxjs';
import { Router } from 'esp-js';
import {IScheduler} from 'rxjs/Scheduler';

declare module 'rxjs/Observable' {

    interface Observable<T> {
        doOnSubscribe(action: () => void) : Rx.Observable<T>;

        // I can't find a way of extending ConnectableObservable in TS
        lazyConnect(onConnect:(subscription: Rx.Subscription) => void) : Rx.Observable<T>;

        subscribeWithRouter<TModel>(
            router : Router,
            modelId: string,
            next?: (value: T, model : TModel) => void,
            error?: (exception: any, model : TModel) => void,
            complete?: (model : TModel) => void
        ) : Rx.Subscription;

        retryWithPolicy(policy, onError?:(err:Error) => void, scheduler? : IScheduler) : Rx.Observable<T>;

        takeUntilInclusive(predicate: (item: T) => boolean) : Rx.Observable<T>;
    }

    interface ObservableStatic {
        prototype: any;
    }
}
*/