import * as React from 'react';
import {Router} from 'esp-js';
import {CashTileStore} from '../store/cashTileStore';
import {InputEvents} from '../events';
import {RootState} from '../store/root/rootState';
import {InputsState} from '../store/inputs/inputsState';
import {PolimerModel} from 'esp-js-polimer';

type Model = PolimerModel<CashTileStore>;

export class CashTileView extends React.Component<{model:Model, router:Router}, any> {
    render() {
        let store: CashTileStore = this.props.model.getStore(); // todo hide this behind infrastructure
        let state : RootState = store.rootState;
        let inputs : InputsState = store.inputs;
        return (
            <div>
                <h1>{inputs.ccyPair}, Cash Tile</h1>
                <button onClick={e => { this.props.router.publishEvent(store.modelId, InputEvents.changeCurrencyPair, {newPair: 'USDZAR'}); }}>
                    Change Currency Pair
                </button>
            </div>
        );
    }
}