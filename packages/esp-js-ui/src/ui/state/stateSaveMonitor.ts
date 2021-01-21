import {DisposableBase, Guard} from 'esp-js';
import {Logger} from '../../core';

const _log: Logger = Logger.create('StateSaveMonitor');

export class StateSaveMonitor extends DisposableBase {
    private _isStarted = false;

    constructor(private _saveAfterMs: number, private _onStateSaveElapsed: () => void) {
        super();
        Guard.isNumber(_saveAfterMs, `saveAfterMs must be a number but got ${_saveAfterMs}`);
        Guard.isFunction(_onStateSaveElapsed, `onStateSaveElapsed must be a function`);
    }

    public start() {
        if (this._isStarted) {
            return;
        }
        this._isStarted = true;
        _log.info(`Starting state save monitor, will save every ${this._saveAfterMs}ms`);
        let setIntervalSubscription = setInterval(
            () => {
                this._onStateSaveElapsed();
            },
            this._saveAfterMs
        );
        this.addDisposable(() => {
            _log.info(`Stopping state save monitor`);
            clearInterval(setIntervalSubscription);
        });
    }
}