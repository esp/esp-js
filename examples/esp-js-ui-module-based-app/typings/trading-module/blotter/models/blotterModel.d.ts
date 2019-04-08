import { RegionManager } from 'esp-js-ui';
import { ModelBase } from 'esp-js-ui';
import { BlotterState } from './blotterState';
export declare class BlotterModel extends ModelBase {
    private _regionManager;
    private _initialState;
    private _regionItem;
    constructor(router: any, regionManager: RegionManager, initialState: BlotterState);
    getTitle(): string;
    observeEvents(): void;
    _close(): void;
}
