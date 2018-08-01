import { Logger, Guard } from '../../core';
import {ModelBase} from '../modelBase';

const _log = Logger.create('RegionManager');

export type ViewCallBack = (model: ModelBase, viewKey?: string) => void;

interface CallbackItem {
    onAdding: ViewCallBack;
    onRemoving: ViewCallBack;
}

interface RegionKeyToCallbackMap {
    [key: string]: CallbackItem;
}

// exists to decouple all the region and their models from the rest of the app
export class RegionManager {
    private _regions: RegionKeyToCallbackMap = {};
    
    // adds a region to the region manager
    public registerRegion(regionName: string, onAddingViewToRegionCallback: ViewCallBack, onRemovingFromRegionCallback: ViewCallBack) {
        Guard.isString(regionName, 'region name required');
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
    public addToRegion(regionName: string, model:ModelBase, displayContext?:string) {
        Guard.isString(regionName, 'region name required');
        Guard.isDefined(model, 'model must be defined');
        _log.debug(`Adding model with id ${model.modelId} (display context:'${displayContext || 'n/a'}') to region ${regionName}`);
        if (!(regionName in this._regions)) {
            let message = `Cannot add model with id ${model.modelId} to region ${regionName} as the region is not registered`;
            _log.error(message);
            throw new Error(message);
        }
        this._regions[regionName].onAdding(model, displayContext);
    }

    public removeFromRegion(regionName: string, model: ModelBase, displayContext?: string): void {
        Guard.isString(regionName, 'region name required');
        Guard.isDefined(model, 'model must be defined');
        _log.debug(`Removing model with id ${model.modelId} (display context:'${displayContext || 'n/a'}') from region ${regionName}`);
        if (!(regionName in this._regions)) {
            let message = `Cannot remove model with id ${model.modelId} from region ${regionName} as the region is not registered`;
            _log.error(message);
            throw new Error(message);
        }
        this._regions[regionName].onRemoving(model, displayContext);
    }
}
