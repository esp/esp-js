import {asyncScheduler, SchedulerLike} from 'rxjs';
import {asap} from 'rxjs-compat/scheduler/asap';

export interface ISchedulerService {
    immediate: SchedulerLike;
    async: SchedulerLike;
}

export class SchedulerService implements ISchedulerService {
    private _immediate: SchedulerLike = asap;
    private _async: SchedulerLike = asyncScheduler;

    get immediate(): SchedulerLike {
        return this._immediate;
    }

    get async(): SchedulerLike {
        return this._async;
    }
}
