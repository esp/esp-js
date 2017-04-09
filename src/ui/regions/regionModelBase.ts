import { Logger } from '../../core';
import RegionManager from './regionManager';
import {Router} from 'esp-js';
import ModelBase from '../modelBase';

let _log = Logger.create('RegionsModelBase');

let _modelIdSeed = 1;
let idFactory = () => { return 'region#' + (++_modelIdSeed); } ;

abstract class RegionModelBase extends ModelBase {
    private _regionManager : RegionManager;
    private _regionName: string;

    constructor(regionName : string, router: Router, regionManager) {
        super(idFactory(), router);
        this._regionName = regionName;
        this._regionManager = regionManager;
    }

    observeEvents() {
        super.observeEvents();
        _log.verbose('starting. Adding model and observing events');
        this._registerWithRegionManager(this._regionName);
    }

    getTitle(): string {
        return '';
    }

    abstract _addToRegion(title:string, modelId:string, view:any, displayContext?:string);

    abstract _removeFromRegion(modelId:string, view:any, displayContext?:string);

    _registerWithRegionManager(regionName) {
        this._regionManager.registerRegion(
            regionName,
            // on add
            (model:ModelBase, displayContext?:string) => {
                this._router.runAction(
                    this.modelId,
                    () => {
                        _log.debug(`Adding model with id ${model.modelId} (display context:'${displayContext || 'n/a'}') to region ${regionName}`);
                        this._addToRegion(model.getTitle(), model.modelId, displayContext);
                    }
                );
            },
            // on remove
            (model:ModelBase, displayContext?:string) => {
                this._router.runAction(
                    this.modelId,
                    () => {
                        _log.debug(`Removing model with id ${model.modelId} (display context:'${displayContext || 'n/a'}') from region ${regionName}`);
                        this._removeFromRegion(model.modelId, displayContext);
                    }
                );
            }
        );
        this.addDisposable(() => {
            this._regionManager.unregisterRegion(regionName);
        });
    }
}
export default RegionModelBase;
