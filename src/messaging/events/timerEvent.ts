export  default class TimerEvent {
    private _date:Date;

    constructor() {
        this._date = new Date();
    }

    get time():Date{
        return this._date;
    }
}
