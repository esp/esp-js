import { Logger } from '../../core';
import {Router} from 'esp-js';
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
    constructor(
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

    private _registerWithRegionManager(regionName) {
        this._regionManager.registerRegion(
            regionName,
            // on add
            (regionItem: RegionItem) => {
                this._router.runAction(
                    this.modelId,
                    () => {
                        _log.debug(`Adding to region ${regionName}. ${regionItem.toString()}`);
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
                        this._removeFromRegion(regionItem);
                    }
                );
            }
        );
        this.addDisposable(() => {
            this._regionManager.unregisterRegion(regionName);
        });
    }
}