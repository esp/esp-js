// This class shows how an OO model can interop with a polimer store
import {Logger} from 'esp-js-ui';
import {DateSelectorState} from './dateSelectorState';
import {DisposableBase, observeEvent, Router} from 'esp-js';
import {DateSelectorEvents} from '../../events';
import {StateHandlerModel} from 'esp-js-polimer/src/stateHandlerModel';

const _log = Logger.create('CashTile-DateSelectorModel');

export class DateSelectorModel extends DisposableBase implements StateHandlerModel<DateSelectorState> {
    private _currentState: DateSelectorState;

    constructor(private _modelId: string, private _router: Router) {
        super();
    }

    @observeEvent(DateSelectorEvents.userEnteredDate)
    _onUserEnteredDate(event: DateSelectorEvents.UserEnteredDateEvent) {
        this._currentState = {
            ...this._currentState,
            dateInput: event.dateInput,
            resolvedDate: new  Date(event.dateInput)
        };
    }

    public getState(): DateSelectorState {
        return this._currentState;
    }
}