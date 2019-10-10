import {Guard, observeEvent} from 'esp-js';
import { Logger } from '../../core';
import {RegionItem} from './regionItem';
import {Router} from '../../../../esp-js/.dist/typings';
import {ModelBase} from '../modelBase';
import {EspUiEventNames} from '../espUiEventNames';
import * as EspUiEvents from '../espUiEvents';

const _log = Logger.create('RegionManager');

export type ViewCallBack = (regionItem: RegionItem) => void;

interface CallbackItem {
    onAdding: ViewCallBack;
    onRemoving: ViewCallBack;
}

interface RegionKeyToCallbackMap {
    [key: string]: CallbackItem;
}

export interface DisplayOptions {
    title?:string;
    /**
     * If provided, will be used to select the @viewBinding on the model with the matching displayContext
     */
    displayContext?:string;
}

// exists to decouple all the region and their models from the rest of the app
export class RegionManager extends ModelBase {
    private _regions: RegionKeyToCallbackMap = {};

    public static ModelId = 'region-manager';

    constructor(router: Router) {
        // this model is designed as a singelton so we effectively hard code the ID here
        super(RegionManager.ModelId, router);
        this.observeEvents();
    }

    // adds a region to the region manager
    public registerRegion(regionName: string, onAddingViewToRegionCallback: ViewCallBack, onRemovingFromRegionCallback: ViewCallBack) {
        Guard.stringIsNotEmpty(regionName, 'region name required');
        Guard.isFunction(onAddingViewToRegionCallback, 'onAddingViewToRegionCallback must be a function');
        Guard.isFunction(onRemovingFromRegionCallback, 'onRemovingFromRegionCallback must be a function');

        _log.debug('registering region {0}', regionName);
        if (this._regions[regionName]) {
            let message = `Cannot register region ${regionName} as it is already registered`;
            _log.error(message);
            throw new Error(message);
        }
        this._regions[regionName] = {
            onAdding: onAddingViewToRegionCallback,
            onRemoving: onRemovingFromRegionCallback
        };
    }

    public unregisterRegion(regionName: string): void {
        _log.debug('Unregistering region {0}', regionName);
        delete this._regions[regionName];
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
    public addToRegion(regionName: string, modelId:string, displayOptions?: DisplayOptions): RegionItem {
        // I'm not dispatching this call onto the router as by design this model doesn't really have any true observers.
        // It does listen to events, but nothing should render it's state, thus this call is synchronous

        Guard.stringIsNotEmpty(regionName, 'region name required');
        Guard.stringIsNotEmpty(modelId, 'modelId must be defined');
        let regionItem = new RegionItem(modelId, displayOptions);
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
        this._regions[regionName].onAdding(regionItem);
        return regionItem;
    }

    public removeFromRegion(regionName: string, regionItem: RegionItem): void {
        Guard.stringIsNotEmpty(regionName, 'region name required');
        Guard.isDefined(regionItem, 'regionItem must be defined');
        _log.debug(`Removing from region ${regionName}. ${regionItem.toString()}.`);
        if (!(regionName in this._regions)) {
            let message = `Cannot remove from region ${regionName} as the region is not registered. ${regionItem}`;
            _log.error(message);
            throw new Error(message);
        }
        this._regions[regionName].onRemoving(regionItem);
    }
}
