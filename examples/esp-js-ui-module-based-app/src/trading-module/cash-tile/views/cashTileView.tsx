import * as React from 'react';
import {Router} from 'esp-js';
import {CashTileStore} from '../store/cashTileStore';
import {InputEvents, RfqEvents} from '../events';
import {InputsState} from '../store/inputs/inputsState';
import {PolimerModel} from 'esp-js-polimer';
import {RequestForQuoteState} from '../store/rfq/requestForQuoteState';

type Model = PolimerModel<CashTileStore>;

export class CashTileView extends React.Component<{model:Model, router:Router}, any> {
    _onCurrencyPairChanged = (event) => {
        let store: CashTileStore = this.props.model.getStore(); // todo hide this behind infrastructure
        this.props.router.publishEvent(store.modelId, InputEvents.changeCurrencyPair, {newPair: event.target.value});
    };
    _onRequestRfq = () => {
        let store: CashTileStore = this.props.model.getStore(); // todo hide this behind infrastructure
        this.props.router.publishEvent(store.modelId, RfqEvents.requestQuote, {});
    };
    render() {
        let store: CashTileStore = this.props.model.getStore(); // todo hide this behind infrastructure
        let inputs: InputsState = store.inputs;
        let requestForQuote: RequestForQuoteState = store.requestForQuote;
        return (
            <div>
                <h1>Cash Tile = {inputs.ccyPair}</h1>
                <select value={inputs.ccyPair} onChange={this._onCurrencyPairChanged}>
                    <option value='EURGBP'>EURGBP</option>
                    <option value='AUDUSD'>AUDUSD</option>
                    <option value='CADJPY'>CADJPY</option>
                    <option value='CHFJPY'>CHFJPY</option>
                    <option value='GBPJPY'>GBPJPY</option>
                </select>
                <button onClick={this._onRequestRfq}>
                    Request RFQ
                </button>
                <br />
                <h2>Rfq Status: {requestForQuote.status}</h2>
                <h2>Price: {requestForQuote.quote ? requestForQuote.quote.price : null}</h2>
            </div>
        );
    }
}