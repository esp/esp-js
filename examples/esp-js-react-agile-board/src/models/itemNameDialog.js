import * as esp from 'esp-js';
import ModelBase from './modelBase';
import EventConsts from '../eventConsts';
import { viewBinding } from 'esp-js-react';
import ItemNameDialogResultType from './itemNameDialogResultType';
import ItemNameDialogView from '../views/itemNameDialogView.jsx';
import idFactory from './idFactory';

/**
 * A dialog for getting the name of something
 */
@viewBinding(ItemNameDialogView)
export default class ItemNameDialog extends ModelBase {
    constructor(router, modal, modalTitle, saveButtonText) {
        super(idFactory('itemNameDialog'), router);
        this.itemName = '';
        this.modalTitle = modalTitle;
        this.saveButtonText = saveButtonText;
        this.modal = modal;
        this._resultsSubject = router.createSubject();
        this.canSave = false;
        this._modalSubscription = null;
    }

    observeEvents() {
        this.router.addModel(this.modelId, this);
        super.observeEvents();
    }

    get resultsStream() {
        return this._resultsSubject.asRouterObservable();
    }

    @esp.observeEvent(EventConsts.ITEM_NAME_CHANGED)
    _onItemNameChanged(event) {
        this.itemName = event.itemName || '';
        this.canSave = this.itemName.length > 0
    }

    @esp.observeEvent(EventConsts.ITEM_NAME_CANCELED)
    _onCanceled(event) {
        this._resultsSubject.onNext({type:ItemNameDialogResultType.Canceled})
    }

    @esp.observeEvent(EventConsts.ITEM_NAME_SAVED)
    _onSaved(event) {
        let name = this.itemName;
        this._reset();
        this._resultsSubject.onNext({type:ItemNameDialogResultType.Saved, name:name})
    }

    open() {
        this.ensureOnDispatchLoop(() => {
            if(!this._modalSubscription) {
                this._modalSubscription = this.modal.open(this.modelId)
                    .streamFor(this.modelId)
                    .subscribe(() => {});
            }
        });
    }

    close() {
        this.ensureOnDispatchLoop(() => {
            if(this._modalSubscription) {
                this._modalSubscription.dispose();
                this._modalSubscription = null;
            }
        });
    }

    _reset() {
        this.itemName = '';
    }
}