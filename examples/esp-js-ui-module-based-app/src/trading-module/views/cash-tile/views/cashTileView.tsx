import * as React from 'react';
import {CashTileModel, InputsState, RequestForQuoteState} from '../model/cashTileModel';
import {DateSelectorEvents, InputEvents, RfqEvents} from '../events';
import {Logger} from 'esp-js-ui';
import {PublishModelEventContext, PublishModelEventDelegate} from 'esp-js-react';
import {useState} from 'react';
import {TileContainerView} from '../../../../common/ui-components/tileContainerView';
import './cashTileView.css';

const _log: Logger = Logger.create('CashTileView');

export interface CashTileViewProps {
    model: CashTileModel;
}

export const CashTileView = ({model}: CashTileViewProps) => {
    const [state, setState] = useState({dateInput: '', updatingDate: false});
    let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    const onCurrencyPairChanged = (event) =>  publishEvent(InputEvents.changeCurrencyPair, {newPair: event.target.value} as InputEvents.CurrencyPairChangedEvent);
    const onRequestRfq = () => publishEvent(RfqEvents.requestQuote, {});
    const onNotionalChanged = (event) => publishEvent(InputEvents.notionalChanged, {notional: event.target.value} as InputEvents.NotionalChanged);
    const onDateInputBlur = (event) => {
        setState({dateInput: '', updatingDate: false});
        publishEvent(DateSelectorEvents.tenorDateChanged, {tenor: event.target.value} as DateSelectorEvents.TenorDateChanged);
    };
    const onDateInputChanged = (e) => {
        setState({dateInput: e.target.value, updatingDate: true});
    };
    let inputs: InputsState = model.inputs;
    let requestForQuote: RequestForQuoteState = model.requestForQuote;
    let dateInput = state.updatingDate ? state.dateInput : model.dateSelector.resolvedDateString;
    let price = null;
    if (requestForQuote.quote) {
        price = (<div className='price'>{inputs.ccyPair} ${inputs.notional} @ {requestForQuote.quote.price}</div>);
    }
    _log.info(`[${model.modelId}] Rendering, selected currency pair: ${inputs.ccyPair}`);
    return (
        <TileContainerView title='Cash Tile' modelId={model.modelId} classNames={'cashTileView'}>
            <select value={inputs.ccyPair} onChange={onCurrencyPairChanged}>
                <option value='EURUSD'>EURUSD</option>
                <option value='EURGBP'>EURGBP</option>
                <option value='AUDUSD'>AUDUSD</option>
                <option value='CADJPY'>CADJPY</option>
                <option value='EURCAD'>EURCAD</option>
                <option value='USDBRL'>USDBRL</option>
            </select>
            <input
                type='text'
                onChange={onNotionalChanged}
                value={inputs.notional || ''}/>
            <div className='modelId'>tenor date (enter 1m)</div>
            <input
                type='text'
                onChange={onDateInputChanged}
                onBlur={onDateInputBlur}
                value={dateInput}/>
            <button onClick={onRequestRfq}>
                Request RFQ
            </button>
            <div className='status'>Pricing Status: {requestForQuote.status}</div>
            <br/>
            {price}
        </TileContainerView>
    );
};