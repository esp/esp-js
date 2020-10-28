import { Logger } from '../../core';
import {Guard, observeEvent, Router} from 'esp-js';
import {ModelBase} from '../modelBase';
import {IdFactory} from '../idFactory';
import {RegionManager} from './regionManager';
import {RegionItem} from './regionItem';
import {getViewFactoryMetadataFromModelInstance, StateSaveProviderConsts, ViewFactoryMetadata} from '../viewFactory';
import {EspUiEventNames} from '../espUiEventNames';
import {SelectedItemChangedEvent} from './multiItemRegion/model';

const _log = Logger.create('RegionsModelBase');
let _modelIdSeed = 1;

export interface RegionModel extends ModelBase {
    getTitle(): string;
    reset(): void;
}

export interface RegionItemModelMetadata {
    viewFactoryMetadata: ViewFactoryMetadata;
    model: any;
}

export interface RegionItemState {
    viewKey: string;
    state: any;
}

export class RegionModelBase extends ModelBase implements RegionModel {
    private _regionItemMetadataByModelId = new Map<string, RegionItemModelMetadata>();
    public items: Array<RegionItem> = [];
    public selectedItem: RegionItem;

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

    @observeEvent(EspUiEventNames.regions_multiItemRegion_selectedItemChanged)
    private _observeSelectedItemChanged(ev: SelectedItemChangedEvent) {
        this.selectedItem = ev.selectedItem;
    }

    public getEspUiModelState(): RegionItemState[] {
        _log.verbose('Staving state');
        const states: RegionItemState[] = [];
        this._regionItemMetadataByModelId.forEach((metadata, modelId) => {
            if (metadata.model[StateSaveProviderConsts.HandlerFunctionName]) {
                const state = metadata.model[StateSaveProviderConsts.HandlerFunctionName]();
                if (state) {
                    states.push({
                        viewKey: metadata.viewFactoryMetadata.viewKey,
                        state
                    });
                } else {
                    _log.warn(`State for model with id ${modelId} was null or undefined`);
                }
            }
        });
        return states;
    }

    public getTitle(): string {
        return '';
    }

    protected _addToRegion(regionItem: RegionItem): void {
        this.items.push(regionItem);
    }

    public reset() {
        this.items.length = 0;
    }

    protected _removeFromRegion(regionItem: RegionItem): void {
        for (let i = this.items.length; i--;) {
            let item = this.items[i];
            if (item.equals(regionItem)) {
                this.items.splice(i, 1);
                if (item === this.selectedItem) {
                    this.selectedItem = null;
                }
                break;
            }
        }
        if (!this.selectedItem && this.items.length > 0) {
            this.selectedItem = this.items[0];
        }
    }

    /**
     * Returns the underlying models currently registered with the region.
     *
     * This is useful if you need to readonly query them (perhaps to save state).
     * You should not modify these, if you meed to modify raise an event to the model via the Router.
     */
    protected get regionItemMetadataByModelId(): Map<string, RegionItemModelMetadata> {
        return new Map(this._regionItemMetadataByModelId);
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
                        this._setRegionItemMetadata(regionItem);
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

    private _setRegionItemMetadata(regionItem: RegionItem) {
        this._router.getModelObservable<any>(regionItem.modelId).take(1).subscribe(model => {
            Guard.isFalsey(this._regionItemMetadataByModelId.has(regionItem.modelId), `Model ${regionItem.modelId} already in region`);
            let viewFactoryMetadata: ViewFactoryMetadata = getViewFactoryMetadataFromModelInstance(model);
            this._regionItemMetadataByModelId.set(regionItem.modelId, {
                viewFactoryMetadata: viewFactoryMetadata,
                model: model
            });
        });
    }

    private _stopObservingModel(regionItem: RegionItem) {
        if (this._regionItemMetadataByModelId.has(regionItem.modelId)) {
            this._regionItemMetadataByModelId.delete(regionItem.modelId);
        }
    }
}