import * as Rx from 'rx';

export interface ISchedulerService {
  immediate: Rx.IScheduler;
  async: Rx.IScheduler;
}

export class SchedulerService implements ISchedulerService {
  private _immediate: Rx.IScheduler = Rx.Scheduler.immediate;
  private _async: Rx.IScheduler = Rx.Scheduler.default;

  get immediate(): Rx.IScheduler {
    return this._immediate;
  }

  get async(): Rx.IScheduler {
    return this._async;
  }
}
