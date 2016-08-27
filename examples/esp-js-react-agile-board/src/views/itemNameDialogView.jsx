import * as esp from 'esp-js';
import React from 'react';
import EventConsts from '../eventConsts';

export default class ItemNameDialogView extends React.Component {
    static propTypes = {
        model: React.PropTypes.object.isRequired,
        router: React.PropTypes.instanceOf(esp.Router).isRequired
    };

    _publishEvent(eventName, event) {
        this.props.router.publishEvent(this.props.model.modelId, eventName, event);
    }

    render() {
        let itemNameDialog = this.props.model;
        return (
            <div className='itemNameDialog'>
                <label>Name:</label>
                <input
                    autoFocus
                    type='text'
                    value={itemNameDialog.itemName}
                    onChange={e => this._publishEvent(EventConsts.ITEM_NAME_CHANGED, {itemName: e.target.value})}/>
            </div>
        )
    }
}