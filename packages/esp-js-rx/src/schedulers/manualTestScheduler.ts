import {VirtualTimeScheduler, VirtualAction} from 'rxjs';

export class ManualTestScheduler extends VirtualTimeScheduler {
    constructor() {
        super(VirtualAction, 0);
    }

    public advanceTime(milliseconds: number): void {
        this.frame += milliseconds;
        this.maxFrames = this.frame;
        this.flush();
    }
}