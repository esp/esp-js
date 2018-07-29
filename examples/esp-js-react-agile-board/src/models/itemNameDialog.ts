import { ModelBase } from './modelBase';
import { EventConst } from '../eventConst';
import { viewBinding } from 'esp-js-react';
import { ItemNameDialogView } from '../views/itemNameDialogView';
import { idFactory } from './idFactory';
import { Disposable, observeEvent, Router, RouterSubject } from 'esp-js';
import { Modal } from './modal';

export enum ItemNameDialogResultType {
    Canceled = 'Canceled',
    Saved = 'Saved'
}

export interface ItemNameDialogResult {
    name?: string;
    type: ItemNameDialogResultType;
}

/**
 * A dialog for getting the name of something
 */
@viewBinding(ItemNameDialogView)
export class ItemNameDialog extends ModelBase {
    private _itemName: string;
    private _modalTitle: string;
    private _saveButtonText: string;
    private _modal: Modal;
    private _resultsSubject: RouterSubject<ItemNameDialogResult>;
    private _canSave: boolean;
    private _modalSubscription: Disposable;

    constructor(router: Router, modal: Modal, modalTitle: string, saveButtonText: string) {
        super(idFactory('itemNameDialog'), router);
        this._itemName = '';
        this._modalTitle = modalTitle;
        this._saveButtonText = saveButtonText;
        this._modal = modal;
        this._resultsSubject = router.createSubject<ItemNameDialogResult>();
        this._canSave = false;
        this._modalSubscription = null;
    }

    public get itemName() {
        return this._itemName;
    }

    public get modalTitle() {
        return this._modalTitle;
    }

    public get saveButtonText() {
        return this._saveButtonText;
    }

    public get modal() {
        return this._modal;
    }

    public get canSave() {
        return this._canSave;
    }

    public get resultsStream() {
        return this._resultsSubject.asRouterObservable(this.router);
    }

    public observeEvents() {
        this.router.addModel(this.modelId, this);
        super.observeEvents();
    }

    @observeEvent(EventConst.ITEM_NAME_CHANGED)
    private _onItemNameChanged(event) {
        this._itemName = event.itemName || '';
        this._canSave = this._itemName.length > 0;
    }

    @observeEvent(EventConst.ITEM_NAME_CANCELED)
    private _onCanceled(event) {
        this._resultsSubject.onNext({type: ItemNameDialogResultType.Canceled});
    }

    @observeEvent(EventConst.ITEM_NAME_SAVED)
    private _onSaved(event) {
        let name = this.itemName;
        this._reset();
        this._resultsSubject.onNext({type: ItemNameDialogResultType.Saved, name: name});
    }

    public open() {
        this.ensureOnDispatchLoop(() => {
            if (!this._modalSubscription) {
                this._modalSubscription = this.modal.open(this.modelId)
                    .streamFor(this.modelId)
                    .subscribe(() => {
                    });
            }
        });
    }

    public close() {
        this.ensureOnDispatchLoop(() => {
            if (this._modalSubscription) {
                this._modalSubscription.dispose();
                this._modalSubscription = null;
            }
        });
    }

    private _reset() {
        this._itemName = '';
    }
}