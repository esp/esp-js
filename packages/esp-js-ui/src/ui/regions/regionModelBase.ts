import { Logger } from '../../core';
import {Disposable, Guard, Router} from 'esp-js';
import {ModelBase} from '../modelBase';
import {IdFactory} from '../idFactory';
import {RegionManager} from './regionManager';
import {RegionItem} from './regionItem';

const _log = Logger.create('RegionsModelBase');
let _modelIdSeed = 1;

export interface RegionModel extends ModelBase {
    getTitle(): string;
    reset(): void;
}

export abstract class RegionModelBase extends ModelBase implements RegionModel {
    private _modelsById = new Map<string, any>();
    private _modelsSubscriptionsById = new Map<string, Disposable>();

    protected constructor(
        protected _regionName : string,
        router: Router,
        protected _regionManager: RegionManager
    ) {
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

    protected abstract _addToRegion(regionItem: RegionItem);

    protected abstract _removeFromRegion(regionItem: RegionItem);

    public reset() { }

    /**
     * Returns the underlying models currently registered with the region.
     *
     * This is useful if you need to readonly query them (perhaps to save state).
     * You should not modify these, if you meed to modify raise an event to the model via the Router.
     */
    protected get modelsById() {
        return new Map(this._modelsById);
    }

    private _registerWithRegionManager(regionName) {
        this._regionManager.registerRegion(
            regionName,
            // on add
            (regionItem: RegionItem) => {
                this._router.runAction(
                    this.modelId,
                    () => {
                        _log.debug(`Adding to region ${regionName}. ${regionItem.toString()}`);
                        this._observeModel(regionItem);
                        this._addToRegion(regionItem);
                    }
                );
            },
            // on remove
            (regionItem: RegionItem) => {
                this._router.runAction(
                    this.modelId,
                    () => {
                        _log.debug(`Removing from region ${regionName}. ${regionItem.toString()}`);
                        this._stopObservingModel(regionItem);
                        this._removeFromRegion(regionItem);
                    }
                );
            }
        );
        this.addDisposable(() => {
            this._regionManager.unregisterRegion(regionName);
        });
    }

    private _observeModel(regionItem: RegionItem) {
        Guard.isFalsey(this._modelsSubscriptionsById.has(regionItem.modelId), `Model ${regionItem.modelId} already in region`);
        let disposable: Disposable = this._router.getModelObservable<any>(regionItem.modelId).subscribe(model => {
            this._modelsById.set(regionItem.modelId, model);
        });
        this._modelsSubscriptionsById.set(regionItem.modelId, disposable);
    }

    private _stopObservingModel(regionItem: RegionItem) {
        if (this._modelsSubscriptionsById.has(regionItem.modelId)) {
            let disposable = this._modelsSubscriptionsById.get(regionItem.modelId);
            this._modelsSubscriptionsById.delete(regionItem.modelId);
            this._modelsById.delete(regionItem.modelId);
            disposable.dispose();
        }
    }
}