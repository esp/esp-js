import * as Rx from 'rx';

export interface ISchedulerService {
  immediate: Rx.IScheduler;
  async: Rx.IScheduler;
}

export class SchedulerService implements ISchedulerService {
  private _immediate: Rx.IScheduler;
  private _async: Rx.IScheduler;

  constructor() {
    this._immediate = Rx.Scheduler.immediate;
    this._async = Rx.Scheduler.default;
  }

  get immediate() {
    return this._immediate;
  }

  get async() {
    return this._async;
  }
}
