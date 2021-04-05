import {asyncScheduler, SchedulerLike, asapScheduler} from 'rxjs';

export interface ISchedulerService {
    immediate: SchedulerLike;
    async: SchedulerLike;
}

export class SchedulerService implements ISchedulerService {
    private _immediate: SchedulerLike = asapScheduler;
    private _async: SchedulerLike = asyncScheduler;

    get immediate(): SchedulerLike {
        return this._immediate;
    }

    get async(): SchedulerLike {
        return this._async;
    }
}
