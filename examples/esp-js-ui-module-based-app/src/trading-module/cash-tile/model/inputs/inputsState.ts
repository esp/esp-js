import {PolimerHandlerMap} from 'esp-js-polimer';
import {
    Logger
} from 'esp-js-ui';
import {InputEvents} from '../../events';
import {observeEvent} from 'esp-js';

const _log = Logger.create('CashTile-InputsState');

export interface InputsState {
    ccyPair: string;
    notional: number;
}

export const defaultInputsStateFactory = (ccyPair?: string): InputsState => {
    return {
        ccyPair: ccyPair || 'EURUSD',
        notional: 1000000
    };
};

export class InputStateHandlers  {
    @observeEvent(InputEvents.changeCurrencyPair)
    _onChangeCurrencyPair(draft: InputsState, event: InputEvents.CurrencyPairChangedEvent) {
        _log.info(`Changing currency pair to ${event.newPair}`, event);
        draft.ccyPair = event.newPair;
    }
    @observeEvent(InputEvents.notionalChanged)
    _onNotionalChanged(draft: InputsState, event: InputEvents.NotionalChanged) {
        _log.info(`Changing notional to ${event.notional}`, event);
        draft.notional = event.notional;
    }
}
