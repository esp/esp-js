import {VirtualTimeScheduler, VirtualAction} from 'rxjs';

export class ManualTestScheduler extends VirtualTimeScheduler {
    constructor() {
        super(VirtualAction, 0);
    }

    public advanceTime(milliseconds: number): void {
        const advancedTo = this.frame + milliseconds;
        this.maxFrames = advancedTo;
        this.flush();
        // set frame after flushing as the base class touches this property
        this.frame = advancedTo;
    }

    public advanceTimeTo(milliseconds: number): void {
        if (milliseconds < this.frame) {
            throw Error(`Time already at offset ${this.frame}, can not 'advanceTo' offset ${milliseconds}`);
        }
        const advanceBy = milliseconds - this.frame;
        this.advanceTime(advanceBy);
    }
}