import {DisposableBase} from 'esp-js';

export class StateSaveMonitor extends DisposableBase {
    private _isStarted = false;

    constructor(private _saveAfterMs: number, private _onStateSaveElapsed: () => void) {
        super();
    }

    public start() {
        if (this._isStarted) {
            return;
        }
        this._isStarted = true;
        let setIntervalSubscription = setInterval(
            () => {
                this._onStateSaveElapsed();
            },
            this._saveAfterMs
        );
        this.addDisposable(() => {
            clearInterval(setIntervalSubscription);
        });
    }
}