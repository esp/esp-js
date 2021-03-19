import {viewBinding} from 'esp-js-react';
import {RegionManager} from 'esp-js-ui';
import {BlotterView} from '../views/blotterView';
import {
    ModelBase,
    IdFactory
} from 'esp-js-ui';
import {BlotterState} from './blotterState';
import {observeEvent} from 'esp-js';
import {BlotterEvents} from '../events';
import {AccountsRefDataService} from '../services/accountsRefDataService';

interface Trade {
    id: string;
    account: string;
}

export type SortType = 'Ascending' | 'Descending';

/**
 * An example OO model, all the OO benefits but none of the immutability benefits which work well with react.
 *
 * i.e. this would need to internally consider exposed state immutability and it's effect on how react renders.
 */
@viewBinding(BlotterView)
export class BlotterModel extends ModelBase {
    private _regionManager: RegionManager;
    private _trades: Trade[] = [];
    private _idSortType: SortType = 'Ascending';

    constructor(
        router,
        regionManager: RegionManager,
        accountsRefDataService: AccountsRefDataService,
        initialState: BlotterState // needs to be last due to how it's resolved via the container
    ) {
        super(IdFactory.createId('blotterModel'), router);
        this._regionManager = regionManager;
        this._idSortType = initialState.idSortType;
        this._trades = accountsRefDataService.accounts.map((account, index) => ({ id: `trade${index}`, account: account}));
        this._sortTrades();
    }

    public getTitle(): string {
        return 'Blotter';
    }

    public get trades(): Trade[] {
        return this._trades;
    }

    public get sortType(): SortType {
        return this._idSortType;
    }

    observeEvents(): void {
        super.observeEvents();
    }

    getEspUiModelState() {
        return { idSortType: this._idSortType } as BlotterState;
    }

    @observeEvent(BlotterEvents.toggleIdSort)
    private _toggleSortType() {
        this._idSortType = this._idSortType === 'Ascending' ? 'Descending' : 'Ascending';
        this._sortTrades();
    }

    private _sortTrades() {
        if (this._idSortType === 'Ascending') {
            this._trades = [...this._trades.sort((a, b) => a.id.localeCompare(b.id))];
        } else {
            this._trades = [...this._trades.sort((a, b) => b.id.localeCompare(a.id))];
        }
    }
}