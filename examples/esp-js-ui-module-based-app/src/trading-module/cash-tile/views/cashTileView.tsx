import * as React from 'react';
import {Router} from 'esp-js';
import CashTileModel from '../models/cashTileModel';

export default class CashTileView extends React.Component<{model:CashTileModel, router:Router}, any> {
    render() {
        let model : CashTileModel = this.props.model;
        return (
            <div>
                <h1>{model.symbol}, Cash Tile</h1>
                <button onClick={e => { this.props.router.publishEvent(this.props.model.modelId, 'log-something', {}); }}>
                    Something that logs stuff
                </button>
            </div>
        );
    }
}