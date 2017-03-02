import * as Rx from 'rx';
import { DisposableBase, SingleModelRouter } from 'esp-js';
import { TimerEvent, EventConst } from '../events';
import { ISchedulerService } from '../../core';

export default class Timer<T> extends DisposableBase {
    _router:SingleModelRouter<T>;
    _schedulerService:ISchedulerService;
    _timerDisposable:Rx.SerialDisposable;

    constructor(router:SingleModelRouter<T>,
                schedulerService:ISchedulerService) {
        super();
        this._router = router;
        this._schedulerService = schedulerService;
        this._timerDisposable = new Rx.SerialDisposable();
        this.addDisposable(this._timerDisposable);
    }

    start() {
        this._scheduleUpdate();
    }

    _scheduleUpdate() {
        this._timerDisposable.setDisposable(
            this._schedulerService.async.scheduleFuture(
                '',
                1000, // every second
                (scheduler: Rx.IScheduler, state: string) => {
                    let shouldRun = true;
                    if(shouldRun) {
                        this._router.publishEvent(EventConst.timerEvent, new TimerEvent());
                        this._scheduleUpdate();
                    }
                    return Rx.Disposable.create(() => {
                        shouldRun = false;
                    });
                }
            )
        );
    }
}
