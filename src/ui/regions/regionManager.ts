import { Logger, Guard } from '../../core';
import ModelBase from '../modelBase';

const _log = Logger.create('RegionManager');

// exists to decouple all the region and their models from the rest of the app
export default class RegionManager {
    private _regions;
    
    constructor() {
        this._regions = { };
    }
    // adds a region to the region manager, should be (viewKey, modelId) => {}
    registerRegion(regionName: string, onAddingViewToRegionCallback, onRemovingFromRegionCallback) {
        Guard.isString(regionName, 'region name required');
        Guard.isFunction(onAddingViewToRegionCallback, 'onAddingViewToRegionCallback must be a function');
        Guard.isFunction(onRemovingFromRegionCallback, 'onRemovingFromRegionCallback must be a function');
        _log.debug('registering region {0}', regionName);
        if (this._regions[regionName]) {
            throw new Error('Region ' + regionName + ' already registered');
        }
        this._regions[regionName] = {
            onAdding: onAddingViewToRegionCallback,
            onRemoving: onRemovingFromRegionCallback
        };
    }
    unregisterRegion(regionName: string): void {
        _log.debug('unregistering region {0}', regionName);
        delete this._regions[regionName];
    }
    // adds a model to be displayed in a region, uses annotations to find view
    addToRegion(regionName: string, model:ModelBase, displayContext?:string) {
        Guard.isString(regionName, 'region name required');
        Guard.isDefined(model, 'model must be defined');
        _log.debug(`Adding model with id ${model.modelId} (display context:'${displayContext || 'n/a'}') to region ${regionName}`);
        if (!this._regions[regionName]) {
            throw new Error('Region ' + regionName + ' not registered');
        }
        this._regions[regionName].onAdding(model, displayContext);
    }
    removeFromRegion(regionName: string, model:ModelBase, displayContext?:string): void {
        Guard.isString(regionName, 'region name required');
        Guard.isDefined(model, 'model must be defined');
        _log.debug(`Removing model with id ${model.modelId} (display context:'${displayContext || 'n/a'}') from region ${regionName}`);
        if (!this._regions[regionName]) {
            throw new Error('Region ' + regionName + ' not registered');
        }
        this._regions[regionName].onRemoving(model, displayContext);
    }
}
