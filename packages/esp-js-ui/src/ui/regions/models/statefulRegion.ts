import {RegionBase} from './regionBase';
import {RegionItemRecord} from './regionItemRecord';

export class StatefulRegion extends RegionBase<object> {
    public get stateSavingEnabled(): boolean {
        return true;
    }

    protected createViewState(regionItemRecord: RegionItemRecord, modelState: object): object {
        // in this case, we're not wrapping anything around modelState, this region has no additional state it needs to store for the views it displays.
        return modelState;
    }
}