import { Logger } from '../../core';
import {Router} from 'esp-js';
import ModelBase from '../modelBase';
import IdFactory from '../idFactory';

let _log = Logger.create('RegionsModelBase');

let _modelIdSeed = 1;

abstract class RegionModelBase extends ModelBase {
    constructor(private _regionName : string, router: Router, private _regionManager) {
        super(IdFactory.createId(`region#${++_modelIdSeed}`), router);
    }

    public observeEvents() {
        super.observeEvents();
        _log.verbose('starting. Adding model and observing events');
        this._registerWithRegionManager(this._regionName);
    }

    public getTitle(): string {
        return '';
    }

    protected abstract _addToRegion(title:string, modelId:string, view:any, displayContext?:string);

    protected abstract _removeFromRegion(modelId:string, view:any, displayContext?:string);

    private _registerWithRegionManager(regionName) {
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
