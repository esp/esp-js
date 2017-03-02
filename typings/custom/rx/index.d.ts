import * as Rx from 'rx';
import { Router } from 'esp-js';

declare module 'rx' {
    interface Observable<T> {
        subscribeWithRouter<T, TModel>(
            router : Router,
            modelId: string,
            onNext?: (value: T, model : TModel) => void,
            onError?: (exception: any, model : TModel) => void,
            onCompleted?: (model : TModel) => void) : Rx.Disposable

        retryWithPolicy<T>(policy, onError?:(err:Error) => void, scheduler? : Rx.IScheduler) : Rx.Observable<T>;

        // this is valid rx but not on rx.all.d.ts
        timeout<TOther>(dueTime: number, other?: Observable<TOther>, scheduler?: Rx.IScheduler): Observable<T>;
    }

    interface ObservableStatic {
        prototype: any;
    }
}
