import {Guard, observeEvent, Router} from 'esp-js';
import {Logger} from '../../../core';
import {RegionItem} from './regionItem';
import {ModelBase} from '../../modelBase';
import {EspUiEventNames} from '../../espUiEventNames';
import {EspUiEvents} from '../../espUiEvents';
import {RegionItemRecord} from './regionItemRecord';
import {RegionBase} from './regionBase';
import {RegionState} from './regionState';

const _log = Logger.create('RegionManager');

export interface DisplayOptions {
    title?:string;
    /**
     * If provided, will be used to select the @viewBinding on the model with the matching displayContext
     */
    displayContext?:string;
}

// exists to decouple all the region and their models from the rest of the app
export class RegionManager extends ModelBase {
    private _regions: { [regionName: string]: RegionBase<any> } = { };

    public static ModelId = 'region-manager';

    constructor(router: Router) {
        // this model is designed as a singelton so we effectively hard code the ID here
        super(RegionManager.ModelId, router);
        this.observeEvents();
    }

    // adds a region to the region manager
    public registerRegion(regionName: string, regionRecord: RegionBase<any>) {
        Guard.stringIsNotEmpty(regionName, 'region name required');
        Guard.isObject(regionRecord, 'regionRecord must be an object');
        Guard.isFunction(regionRecord.addRegionItem, 'regionRecord.onAdding must be a function');
        Guard.isFunction(regionRecord.removeRegionItem, 'regionRecord.onRemoving must be a function');
        _log.debug(`registering region ${regionName}`);
        if (this._regions[regionName]) {
            let message = `Cannot register region ${regionName} as it is already registered`;
            _log.error(message);
            throw new Error(message);
        }
        this._regions[regionName] = regionRecord;
    }

    public getRegions(): RegionBase<any>[] {
        return Object.values(this._regions);
    }

    public getRegion<TRegionState, TViewState>(regionName: string): RegionBase<TRegionState> {
        return this._regions[regionName];
    }

    public unregisterRegion(regionName: string): void {
        _log.debug('Unregistering region {0}', regionName);
        delete this._regions[regionName];
    }

    public loadRegion(regionState: RegionState): void {
        Guard.isObject(regionState, 'regionState must be an object');
        _log.debug(`Loading region ${regionState.regionName} at version ${regionState.stateVersion}, view count ${regionState.regionRecordStates ? regionState.regionRecordStates.length : 0}`);
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

    @observeEvent(EspUiEventNames.regions_regionManager_removeFromRegion)
    private _onRemoveFromToRegion(event: EspUiEvents.RemoveFromRegionEvent) {
        if (event && event.regionName && event.regionItem) {
            this.removeFromRegion(event.regionName, event.regionItem);
        } else {
            _log.warn(`Ignoring event ${EspUiEventNames.regions_regionManager_removeFromRegion} as incoming event not well formed`, event);
        }
    }

    // adds a model to be displayed in a region, uses annotations to find view
    public addToRegion(regionName: string, regionItem: RegionItem): RegionItem;
    public addToRegion(regionName: string, modelId:string): RegionItem;
    public addToRegion(regionName: string, modelId:string, displayOptions: DisplayOptions): RegionItem;
    public addToRegion(...args: (string|DisplayOptions|RegionItem)[]): RegionItem {
        // I'm not dispatching this call onto the router as by design this model doesn't really have any true observers.
        // It does listen to events, but nothing should render it's state, thus this call is synchronous
        let regionName = <string>args[0];
        let regionItem: RegionItem;
        if (args.length === 2) {
            if (typeof args[1] === 'string') {
                regionItem = RegionItem.create(args[1]);
            } else {
                Guard.isDefined(args[1], 'Second parameter (modelId or regionItem) required but was undefined or null');
                regionItem = <RegionItem>args[1];
            }
        } else {
            regionItem = RegionItem.create(<string>args[1], <DisplayOptions>args[2]);
        }
        this._addToRegion(regionName, regionItem);
        return regionItem;
    }

    private _addToRegion(regionName: string, regionItem: RegionItem) {
        if (!(regionName in this._regions)) {
            let message = `Cannot add model with id ${regionItem.modelId} to region ${regionName} as the region is not registered`;
            _log.error(message);
            throw new Error(message);
        }
        _log.debug(`Adding to region ${regionName}. ${regionItem.toString()}.`);
        this._regions[regionName].addToRegion(regionItem);
        return regionItem;
    }

    /**
     * Removes all views in this region for the  given model ID
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
            _log.debug(`Removing the following region records from region ${regionName}: ${recordsToRemove}.`);
            if (!(regionName in this._regions)) {
                let message = `Cannot remove the following records from region ${regionName} as the region is not registered: ${recordsToRemove}`;
                _log.error(message);
                throw new Error(message);
            }
            recordsToRemove.forEach(recordId => {
                this._regions[regionName].removeFromRegion(recordId);
            });
        }
    }

    public existsInRegion(regionName: string, modelId: string): boolean;
    public existsInRegion(regionName: string, predicate: (regionItemRecord: RegionItemRecord) => boolean): boolean;
    public existsInRegion(...args: any[]): boolean {
        let region = this._regions[args[0]];
        return region.existsInRegion(args[1]);
    }
}
