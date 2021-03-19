import * as Rx from 'rxjs';
import {IScheduler} from 'rxjs/Scheduler';

export interface ISchedulerService {
  immediate: IScheduler;
  async: IScheduler;
}

export class SchedulerService implements ISchedulerService {
  private _immediate: IScheduler = Rx.Scheduler.asap;
  private _async: IScheduler = Rx.Scheduler.async;

  get immediate(): IScheduler {
    return this._immediate;
  }

  get async(): IScheduler {
    return this._async;
  }
}
