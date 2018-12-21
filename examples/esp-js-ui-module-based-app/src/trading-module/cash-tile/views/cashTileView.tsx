import * as React from 'react';
import {Router} from 'esp-js';
import {CashTileStore} from '../store/cashTileStore';
import {DateSelectorEvents, InputEvents, RfqEvents} from '../events';
import {InputsState} from '../store/inputs/inputsState';
import {PolimerModel} from 'esp-js-polimer';
import {RequestForQuoteState} from '../store/rfq/requestForQuoteState';

type Model = PolimerModel<CashTileStore>;

export class CashTileView extends React.Component<{model:Model, router:Router}, any> {
    constructor(props) {
        super(props);
        this.state = {
            dateInput: '',
            updatingDate: false
        };
    }
    _onCurrencyPairChanged = (event) => {
        this._publishEvent(InputEvents.changeCurrencyPair, {newPair: event.target.value} as InputEvents.CurrencyPairChangedEvent);
    };
    _onRequestRfq = () => {
        this._publishEvent(RfqEvents.requestQuote, {});
    };
    _onNotionalChanged = (event) => {
        this._publishEvent(InputEvents.notionalChanged, {notional: event.target.value} as InputEvents.NotionalChanged);
    };
    _onDateInputBlur = (event) => {
        this.setState({dateInput: '', updatingDate: false});
        this._publishEvent(DateSelectorEvents.tenorDateChanged, {tenor: event.target.value} as DateSelectorEvents.TenorDateChanged);
    };
    _onDateInputChanged = (e) => {
        this.setState({dateInput: e.target.value, updatingDate: true});
    };
    _publishEvent = (event, payload) => {
        let store: CashTileStore = this.props.model.getStore(); // todo hide this behind infrastructure
        this.props.router.publishEvent(store.modelId, event, payload);
    };
    render() {
        let store: CashTileStore = this.props.model.getStore(); // todo hide this behind infrastructure
        let inputs: InputsState = store.inputs;
        let requestForQuote: RequestForQuoteState = store.requestForQuote;
        let dateInput = this.state.updatingDate ? this.state.dateInput : store.dateSelector.resolvedDateString;
        let price = null;
        if (requestForQuote.quote) {
            price = (<div className='price'>{inputs.ccyPair} ${inputs.notional} @ {requestForQuote.quote.price}</div>);
        }
        return (
            <div className='cashTileView'>
                <div className='header'>Cash Tile</div>
                <div className='modelId'>id: {store.modelId}</div>
                <select value={inputs.ccyPair} onChange={this._onCurrencyPairChanged}>
                    <option value='EURGBP'>EURGBP</option>
                    <option value='AUDUSD'>AUDUSD</option>
                    <option value='CADJPY'>CADJPY</option>
                    <option value='CHFJPY'>CHFJPY</option>
                    <option value='GBPJPY'>GBPJPY</option>
                </select>
                <input
                    type='text'
                    onChange={this._onNotionalChanged}
                    value={inputs.notional}/>
                <div className='modelId'>tenor date (enter 1m)</div>
                <input
                    type='text'
                    onChange={this._onDateInputChanged }
                    onBlur={this._onDateInputBlur}
                    value={dateInput}/>
                <button onClick={this._onRequestRfq}>
                    Request RFQ
                </button>
                <div className='status'>Pricing Status: {requestForQuote.status}</div>
                <br />
                {price}
            </div>
        );
    }
}