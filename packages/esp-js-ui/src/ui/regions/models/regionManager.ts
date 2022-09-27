import {Guard, observeEvent, Router, Logger} from 'esp-js';
import {RegionItem} from './regionItem';
import {ModelBase} from '../../modelBase';
import {EspUiEventNames} from '../../espUiEventNames';
import {EspUiEvents} from '../../espUiEvents';
import {RegionItemRecord} from './regionItemRecord';
import {RegionBase} from './regionBase';
import {RegionState} from './regionState';

const _log = Logger.create('RegionManager');

export interface RegionItemOptions {
    title?: string;
    /**
     * If provided, will be used to select the @viewBinding on the model with the matching displayContext
     */
    displayContext?: string;
    /**
     * An optional, caller provided, tag which can later be used to identify the region item.
     */
    tag?: string;
}

// exists to decouple all the region and their models from the rest of the app
export class RegionManager extends ModelBase {
    // Other than the regions, this has no state.
    // The regions own their own state and can be interacted with independently.
    // That said, it's best to use this class as a facade.
    private _regions: { [regionName: string]: RegionBase<any> } = { };

    public static ModelId = 'region-manager';

    constructor(router: Router) {
        // this model is designed as a singelton so we effectively hard code the ID here
        super(RegionManager.ModelId, router);
        this.observeEvents();
    }

    // adds a region to the region manager
    public registerRegion(regionName: string, regionBase: RegionBase) {
        Guard.stringIsNotEmpty(regionName, 'region name required');
        Guard.isObject(regionBase, 'regionBase must be an object');
        _log.verbose(`registering region ${regionName}`);
        if (this._regions[regionName]) {
            let message = `Cannot register region ${regionName} as it is already registered`;
            _log.error(message);
            throw new Error(message);
        }
        this._regions[regionName] = regionBase;
    }

    public getRegions(): RegionBase<any>[] {
        return Object.values(this._regions);
    }

    public getRegion<TRegionState, TViewState>(regionName: string): RegionBase<TRegionState> {
        return this._regions[regionName];
    }

    public unregisterRegion(regionName: string): void {
        _log.verbose('Unregistering region {0}', regionName);
        delete this._regions[regionName];
    }

    public loadRegion(regionState: RegionState): void {
        Guard.isObject(regionState, 'regionState must be an object');
        _log.verbose(`Loading region ${regionState.regionName} at version ${regionState.stateVersion}, view count ${regionState.regionRecordStates ? regionState.regionRecordStates.length : 0}`);
        let region = this._regions[regionState.regionName];
        region.load(regionState);
    }

    @observeEvent(EspUiEventNames.regions_regionManager_addToRegion)
    private _onAddToRegion(event: EspUiEvents.AddToRegionEvent) {
        if (event && event.regionName && event.regionItem) {
            this._addToRegion(event.regionName, event.regionItem);
        } else {
            _log.warn(`Ignoring event ${EspUiEventNames.regions_regionManager_addToRegion} as incoming event not well formed`, event);
        }
    }

    @observeEvent(EspUiEventNames.regions_regionManager_updateRegionItemOptions)
    private _updateRegionItem(event: EspUiEvents.UpdateRegionItemEvent) {
        if (event && event.options) {
            this.updateRegionItemOptions(event.id, event.options);
        } else {
            _log.warn(`Ignoring event ${EspUiEventNames.regions_regionManager_updateRegionItemOptions} as incoming event not well formed`, event);
        }
    }

    @observeEvent(EspUiEventNames.regions_regionManager_removeFromRegion)
    private _onRemoveFromToRegion(event: EspUiEvents.RemoveFromRegionEvent) {
        if (event && event.regionName && event.regionItem) {
            this.removeFromRegion(event.regionName, event.regionItem);
        } else {
            _log.warn(`Ignoring event ${EspUiEventNames.regions_regionManager_removeFromRegion} as incoming event not well formed`, event);
        }
    }

    /**
     * Adds a model to the region.
     * It's view will be discovered based on model metadata.
     */
    public addToRegion(regionName: string, modelId:string);
    /**
     * Adds a model to the region.
     * It's view will be discovered based on model metadata.
     */
    public addToRegion(regionName: string, regionItem: RegionItem);
    public addToRegion(...args: (string|RegionItem)[]) {
        // I'm not dispatching this call onto the router as by design this model doesn't really have any true observers.
        // It does listen to events, but nothing should render it's state, thus this call is synchronous
        let regionName = <string>args[0];
        this._addToRegion(regionName, args[1]);
    }

    private _ensureRegionExist(regionName: string, errorMessage: string) {
        if (!(regionName in this._regions)) {
            let message = `Region ${regionName} is not registered. ${errorMessage}`;
            _log.error(message);
            throw new Error(message);
        }
    }

    private _addToRegion(regionName: string, itemOrModelId: RegionItem | string) {
        this._ensureRegionExist(regionName, `Region ${regionName} not found.`);
        this._regions[regionName].addToRegion(<any>itemOrModelId);
    }

    /**
     * Set the selected item
     */
    public setSelected(modelId: string);
    public setSelected(regionItem: RegionItem);
    public setSelected(regionItemRecord: RegionItemRecord);
    public setSelected(...args: any[]) {
        for (const region of this.getRegions()) {
            let arg = args[0];
            if(region.existsInRegion(arg)) {
                region.setSelected(arg);
                // While a model could be in multiple regions, a record can only be in 1, given that we break out here.
                break;
            }
        }
    }

    /**
     * Used to update the region item.
     * Typically this is only to update the associated RegionItemOptions.
     * The
     */
    public updateRegionItemOptions(modelId: string, RegionItemOptions);
    public updateRegionItemOptions(regionItem: RegionItem);
    public updateRegionItemOptions(...args: any[]) {
        for (const region of this.getRegions()) {
            if (region.existsInRegion(args[0])) {
                region.updateRegionItemOptions(args[0]);
                // While a model could be in multiple regions, a record can only be in 1, given that we break out here.
                break;
            }
        }
    }

    /**
     * Removes all views in this region for the given model ID
     */
    public removeFromRegion(regionName: string, modelId: string): void;
    /**
     * Removes the record identified by the given RegionItem (using regionItem.regionRecordId)
     */
    public removeFromRegion(regionName: string, regionItem: RegionItem): void;
    public removeFromRegion(...args: (string|RegionItem)[]): void {
        let regionName = <string>args[0];
        let modelId: string;
        let recordsToRemove: string[];
        Guard.stringIsNotEmpty(regionName, 'regionName required');
        if (typeof args[1] === 'string') {
            modelId = args[1];
            Guard.stringIsNotEmpty(modelId, 'modelId required');
            recordsToRemove = this._regions[regionName].regionRecords
                .filter(r => r.modelCreated)
                .filter(r => r.modelId === modelId)
                .map(r => r.id);

        } else {
            Guard.isDefined(args[1], 'Second parameter (modelId or regionItem) required but was undefined or null');
            let regionItem = <RegionItem>args[1];
            recordsToRemove = [regionItem.regionRecordId];
        }
        // It's possible there are no records found, in this case we silently ignore
        if (recordsToRemove.length > 0) {
            _log.verbose(`Removing the following region records from region ${regionName}: ${recordsToRemove}.`);
            this._ensureRegionExist(regionName, `Cannot remove records ${recordsToRemove}.`);
            recordsToRemove.forEach(recordId => {
                this._regions[regionName].removeFromRegion(recordId);
            });
        }
    }

    public removeFromAllRegions(modelId: string) {
        for (const region of this.getRegions()) {
            let recordsToRemove: string[];
            recordsToRemove = region.regionRecords
                .filter(r => r.modelCreated)
                .filter(r => r.modelId === modelId)
                .map(r => r.id);
            _log.verbose(`Removing the following region records from region ${region.name}: ${recordsToRemove}.`);
            recordsToRemove.forEach(recordId => {
                region.removeFromRegion(recordId);
            });
        }
    }

    /**
     * Returns true if any view for the give model ID exists in the region.
     *
     * @deprecated use existsInRegion()
     */
    public existsInRegionByModelId(regionName: string, modelId: string): boolean {
        return this.existsInRegion(regionName, rr => rr.modelId === modelId);
    }

    /**
     * Returns true if a view for the give regionItem exists in the region.
     *
     * @deprecated use existsInRegion()
     */
    public existsInRegionByRegionItem(regionName: string, regionItem: RegionItem): boolean {
        return this.existsInRegion(regionName, regionItem);
    }

    /**
     * Returns true if a view for the give regionRecordId exists in the region.
     * @deprecated use existsInRegion()
     */
    public existsInRegionByRecordId(regionName: string, regionRecordId: string): boolean {
        return this.existsInRegion(regionName, regionRecordId);
    }

    public existsInRegion(regionName: string, modelId: string): boolean;
    public existsInRegion(regionName: string, regionItem: RegionItem): boolean;
    public existsInRegion(regionName: string, regionItemRecord: RegionItemRecord): boolean;
    public existsInRegion(regionName: string, predicate: (regionItemRecord: RegionItemRecord) => boolean): boolean;
    public existsInRegion(...args: any[]): boolean {
        return this._regions[args[0]].existsInRegion(args[1]);
    }
}
