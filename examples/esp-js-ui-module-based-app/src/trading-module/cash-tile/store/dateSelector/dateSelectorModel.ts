// This class shows how an OO model can interop with a polimer store
import {Logger} from 'esp-js-ui';
import {DateSelectorState} from './dateSelectorState';
import {DisposableBase, observeEvent, Router} from 'esp-js';
import {StateHandlerModel} from 'esp-js-polimer';
import {DateSelectorEvents} from '../../events';

const _log = Logger.create('CashTile-DateSelectorModel');

export class DateSelectorModel extends DisposableBase implements StateHandlerModel<DateSelectorState> {
    private _currentState: DateSelectorState;

    constructor(private _modelId: string, private _router: Router) {
        super();
    }

    @observeEvent(DateSelectorEvents.tenorDateChanged)
    _onTenorDateChanged(event: DateSelectorEvents.TenorDateChanged) {
        let resolvedDate: Date;
        if (event.tenor === '1m') {
            resolvedDate = new Date();
            resolvedDate.setDate(resolvedDate.getDate()+7);
        }
        this._currentState = {
            ...this._currentState,
            dateInput: event.tenor,
            resolvedDate: resolvedDate,
            resolvedDateString: resolvedDate ? resolvedDate.toDateString() : ''
        };
    }

    public getEspPolimerState(): DateSelectorState {
        return this._currentState;
    }
}