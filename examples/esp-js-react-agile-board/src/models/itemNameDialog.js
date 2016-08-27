import * as esp from 'esp-js';
import ModelBase from './modelBase';
import EventConsts from '../eventConsts';
import { viewBinding } from 'esp-js-react';
import ItemNameDialogView from '../views/itemNameDialogView.jsx';
import ModalResultType from './modalResultType';

@viewBinding(ItemNameDialogView)
export default class ItemNameDialog extends ModelBase {
    constructor(modelId, router, modal) {
        super(modelId, router);
        this.itemName = '';
        this.modal = modal;
    }

    @esp.observeEvent(EventConsts.ITEM_NAME_CHANGED)
    _onItemNameChanged(event) {
        this.itemName = event.itemName || '';
    }

    getName(saveButtonText, onNameSetCallback) {
        this.modal.open(this, { title: saveButtonText, saveButtonText: saveButtonText })
            .streamFor(this.modelId)
            .subscribe(
                modalResultType => {
                    if(modalResultType === ModalResultType.Saved) {
                        onNameSetCallback(this.itemName);
                    }
                    this._reset();
                }
            );
    }

    _reset() {
        this.itemName = '';
    }
}