import * as Rx from 'rxjs';
import {Scheduler} from 'rxjs/Scheduler';

export interface ISchedulerService {
  immediate: Scheduler;
  async: Scheduler;
}

export class SchedulerService implements ISchedulerService {
  private _immediate: Scheduler = Rx.Scheduler.asap;
  private _async: Scheduler = Rx.Scheduler.async;

  get immediate(): Scheduler {
    return this._immediate;
  }

  get async(): Scheduler {
    return this._async;
  }
}
