import {viewBinding} from 'esp-js-react';
import {RegionManager} from 'esp-js-ui';
import {BlotterView} from '../views/blotterView';
import {
    Logger,
    ModelBase,
    IdFactory
} from 'esp-js-ui';
import {BlotterState} from './blotterState';

@viewBinding(BlotterView)
export class BlotterModel extends ModelBase {
    private _regionManager: RegionManager;
    private _initialState: BlotterState;

    constructor(
        router,
        regionManager: RegionManager,
        initialState: BlotterState // needs to be last due to how it's resolved via the container
    ) {
        super(IdFactory.createId('blotterModel'), router);
        this._regionManager = regionManager;
        this._initialState = initialState;
    }

    public getTitle(): string {
        return 'Blotter';
    }

    observeEvents(): void {
        super.observeEvents();
        this._regionManager.addToRegion(
            this._initialState.regionName,
            this
        );
        this.addDisposable(() => {
            this._close();
        });
    }

    _close() {
        this._regionManager.removeFromRegion(this._initialState.regionName, this);
    }
}