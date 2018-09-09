import { Logger, Guard } from '../../core';
import {RegionItem} from './regionItem';
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
export class RegionManager {
    private _regions: RegionKeyToCallbackMap = {};
    
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

    // adds a model to be displayed in a region, uses annotations to find view
    public addToRegion(regionName: string, modelId:string, displayOptions?: DisplayOptions): RegionItem {
        Guard.stringIsNotEmpty(regionName, 'region name required');
        Guard.stringIsNotEmpty(modelId, 'modelId must be defined');
        if (!(regionName in this._regions)) {
            let message = `Cannot add model with id ${modelId} to region ${regionName} as the region is not registered`;
            _log.error(message);
            throw new Error(message);
        }
        let regionItem = new RegionItem(modelId, displayOptions);
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
