import * as React from 'react';
import { EventConst } from '../eventConst';
import { Router } from 'esp-js';

export interface ItemNameDialogViewProps {
    model: any;
    router: Router;
}

export class ItemNameDialogView extends React.Component<ItemNameDialogViewProps, {}> {
    private _publishEvent(eventType, event) {
        this.props.router.publishEvent(this.props.model.modelId, eventType, event);
    }

    render() {
        let itemNameDialog = this.props.model;
        return (
            <div className='itemNameDialog'>
                <div className='itemNameDialog__header'>
                    <span
                        className='modal__close'
                        onClick={() => this._publishEvent(EventConst.ITEM_NAME_CANCELED, {})}>
                        x
                    </span>
                    <h2>{itemNameDialog.modalTitle}</h2>
                </div>
                <div className='itemNameDialog__body'>
                    <label>Name:</label>
                    <input
                        autoFocus
                        type='text'
                        value={itemNameDialog.itemName}
                        maxLength={200}
                        onChange={e => this._publishEvent(EventConst.ITEM_NAME_CHANGED, {itemName: e.target.value})}
                    />
                    <label>{Math.abs(itemNameDialog.itemName.length - 200)} characters left</label>
                </div>
                <div className='itemNameDialog__footer'>
                    <input
                        type='button'
                        onClick={() => this._publishEvent(EventConst.ITEM_NAME_CANCELED, {})}
                        value='Cancel'
                    />
                    <input
                        type='button'
                        disabled={!itemNameDialog.canSave}
                        onClick={() => this._publishEvent(EventConst.ITEM_NAME_SAVED, {})}
                        value={itemNameDialog.saveButtonText}
                    />
                </div>
            </div>
        );
    }
}
