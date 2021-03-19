import {DisposableBase, DisposableWrapper} from 'esp-js';
import {DisposableItem} from 'esp-js';

export class SerialDisposable extends DisposableBase {
    private _disposableItem: DisposableWrapper;

    constructor() {
        super();
        this.addDisposable(() => {
            this._disposeItem();
        });
    }

    public setDisposable(disposable: DisposableItem) {
        this._disposeItem();
        this._disposableItem = new DisposableWrapper(disposable);
    }

    private _disposeItem = () => {
        if (this._disposableItem) {
            this._disposableItem.dispose();
        }
    }
}
