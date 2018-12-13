// This class shows how an OO model can interop with a polimer store
import {Logger} from 'esp-js-ui';
import {DateSelectorState} from './dateSelectorState';
import {DisposableBase, observeEvent, Router} from 'esp-js';
import {DateSelectorEvents} from '../../events';

const _log = Logger.create('CashTile-DateSelectorModel');

export class DateSelectorModel extends DisposableBase {
    private _currentState: DateSelectorState;

    constructor(private _modelId: string, private _router: Router) {
        super();
    }

    @modelInitialiser
    public initialise(): void {
        this.addDisposable(this._router.observeEventsOn(this._modelId, this));
    }

    @observeEvent(DateSelectorEvents.userEnteredDate)
    _onUserEnteredDate(event: DateSelectorEvents.UserEnteredDateEvent) {
        this._currentState = {
            ...this._currentState,
            dateInput: event.dateInput,
            resolvedDate: new  Date(event.dateInput)
        };
    }

    @stateProvider
    public getState(lastState: DateSelectorState): DateSelectorState {
        return this._currentState;
    }
}