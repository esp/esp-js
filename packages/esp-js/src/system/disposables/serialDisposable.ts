import {DisposableBase} from './disposableBase';
import {DisposableWrapper} from './disposableWrapper';
import {DisposableItem} from './disposable';

export class SerialDisposable extends DisposableBase {
    private _disposableItem: DisposableWrapper;

    constructor() {
        super();
        this.addDisposable(() => {
            this._disposeItem();
        });
    }

    public get current() {
        return this._disposableItem;
    }

    public setDisposable(disposable: DisposableItem) {
        this._disposeItem();
        if (disposable) {
            this._disposableItem = new DisposableWrapper(disposable);
        }
    }

    private _disposeItem = () => {
        if (this._disposableItem) {
            this._disposableItem.dispose();
            this._disposableItem = null;
        }
    }
}
