import * as React from 'react';
import {Router} from 'esp-js';
import CashTileModel from '../models/cashTileModel';

export default class CashTileView extends React.Component<{model:CashTileModel, router:Router}, any> {
    render() {
        let model : CashTileModel = this.props.model;
        return (
            <div>
                <h1>{model.symbol}, Cash Tile</h1>
            </div>
        );
    }
}



