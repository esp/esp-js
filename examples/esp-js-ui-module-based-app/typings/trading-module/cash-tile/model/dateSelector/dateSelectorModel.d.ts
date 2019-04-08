import { DateSelectorState } from './dateSelectorState';
import { DisposableBase, Router } from 'esp-js';
import { StateHandlerModel } from 'esp-js-polimer';
import { DateSelectorEvents } from '../../events';
export declare class DateSelectorModel extends DisposableBase implements StateHandlerModel<DateSelectorState> {
    private _modelId;
    private _router;
    private _currentState;
    constructor(_modelId: string, _router: Router);
    _onTenorDateChanged(event: DateSelectorEvents.TenorDateChanged): void;
    getEspPolimerState(): DateSelectorState;
}
