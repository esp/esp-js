// This class shows how an OO model can interop with a polimer immurable model
import {Logger} from 'esp-js-ui';
import {DisposableBase, observeEvent, Router} from 'esp-js';
import {StateHandlerModel} from 'esp-js-polimer';
import {DateSelectorEvents, TileEvents} from '../../events';
import {DateSelectorState} from '../cashTileModel';

const _log = Logger.create('CashTile-DateSelectorModel');

export const DateSelectorInitialState: DateSelectorState = {
    dateInput: '',
    resolvedDate: null,
    resolvedDateString: ''
};

/**
 * An example OO model, perhaps from a legacy part of the code base, which can interact with Polimer models.
 */
export class DateSelectorModel extends DisposableBase implements StateHandlerModel<DateSelectorState> {
    private _initialTenor: string = null;
    private _currentState: DateSelectorState = DateSelectorInitialState;

    constructor(private _modelId: string, private _router: Router, initialTenor: string) {
        super();
        this._initialTenor = initialTenor;
    }

    @observeEvent(TileEvents.bootstrap)
    _bootstrap() {
        this._resolveDate(this._initialTenor);
    }

    @observeEvent(DateSelectorEvents.tenorDateChanged)
    _onTenorDateChanged(event: DateSelectorEvents.TenorDateChanged) {
        this._resolveDate(event.tenor);
    }

    public getEspPolimerState(): DateSelectorState {
        return this._currentState;
    }

    private _resolveDate(tenor: string) {
        let resolvedDate: Date;
        if (tenor === '1m') {
            resolvedDate = new Date();
            resolvedDate.setDate(resolvedDate.getDate()+7);
        }
        this._currentState = {
            ...this._currentState,
            dateInput: tenor,
            resolvedDate: resolvedDate,
            resolvedDateString: resolvedDate ? resolvedDate.toDateString() : ''
        };
    }
}