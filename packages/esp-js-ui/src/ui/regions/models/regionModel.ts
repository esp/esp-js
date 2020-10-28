import { Logger } from '../../../core';
import {Guard, observeEvent, Router} from 'esp-js';
import {ModelBase} from '../../modelBase';
import {IdFactory} from '../../idFactory';
import {RegionManager} from '../regionManager';
import {RegionItem} from './regionItem';
import {getViewFactoryMetadataFromModelInstance, ViewFactoryMetadata} from '../../viewFactory';
import {EspUiEventNames} from '../../espUiEventNames';
import {RegionItemState} from './regionItemState';
import {SelectedItemChangedEvent} from './events';

const _log = Logger.create('RegionsModelBase');
let _modelIdSeed = 1;

export class RegionModel extends ModelBase {
    private _regionState = new Map<string, RegionItemState>();
    private _items: Array<RegionItem> = [];
    public selectedItem: RegionItem;

    protected constructor(
        protected _regionName : string,
        router: Router,
        protected _regionManager: RegionManager
    ) {
        super(IdFactory.createId(`region#${++_modelIdSeed}`), router);
    }

    public get items() {
        return this._items;
    }

    /**
     * Returns the underlying models currently registered with the region.
     *
     * This is useful if you need to readonly query them (perhaps to save state).
     * You should not modify these, if you meed to modify raise an event to the model via the Router.
     */
    protected get regionState(): Map<string, RegionItemState> {
        return new Map(this._regionState);
    }

    public observeEvents() {
        super.observeEvents();
        _log.verbose('starting. Adding model and observing events');
        this._registerWithRegionManager(this._regionName);
    }

    public getTitle(): string {
        return '';
    }

    public reset() {
        this._regionState = new Map();
        this._items = [];
    }

    @observeEvent(EspUiEventNames.regions_multiItemRegion_selectedItemChanged)
    private _observeSelectedItemChanged(ev: SelectedItemChangedEvent) {
        this.selectedItem = ev.selectedItem;
    }

    // public getEspUiModelState(): RegionItemState[] {
    //     _log.verbose('Staving state');
    //     const states: RegionItemState[] = [];
    //     this._regionState.forEach((metadata, modelId) => {
    //         if (metadata.model[StateSaveProviderConsts.HandlerFunctionName]) {
    //             const state = metadata.model[StateSaveProviderConsts.HandlerFunctionName]();
    //             if (state) {
    //                 states.push({
    //                     viewKey: metadata.viewFactoryMetadata.viewKey,
    //                     state
    //                 });
    //             } else {
    //                 _log.warn(`State for model with id ${modelId} was null or undefined`);
    //             }
    //         }
    //     });
    //     return states;
    // }

    // exists for backwards compatibility
    protected _addToRegion(regionItem: RegionItem): void {
        this._addToRegionInternal(regionItem);
    }

    // exists for backwards compatibility
    protected _removeFromRegion(regionItem: RegionItem): void {
        this._removeFromRegionInternal(regionItem);
    }

    private _addToRegionInternal(regionItem: RegionItem): void {
        Guard.isFalsey(this._regionState.has(regionItem.modelId), `Model ${regionItem.modelId} already in region`);
        this._router.getModelObservable<any>(regionItem.modelId).subscribe(model => {
            this._router.runAction(this.modelId, () => {
                let viewFactoryMetadata: ViewFactoryMetadata = getViewFactoryMetadataFromModelInstance(model);
                let regionItemState = this._regionState.get(regionItem.modelId);
                // We code a bit defensively here as the model could be added later, perhaps code removed it from a region by this point.
                if (regionItemState) {
                    regionItemState.model = model;
                    regionItemState.viewFactoryMetadata = viewFactoryMetadata;
                }
            });
        });
        this._regionState.set(
            regionItem.modelId,
            { viewFactoryMetadata: null, model: null, regionItem}
        );
        // for historical reasons we also maintain an array of RegionItems
        let copy = this._items.slice();
        copy.push(regionItem);
        this._items = copy;
    }

    private _removeFromRegionInternal(regionItem: RegionItem): void {
        for (let i = this._items.length; i--;) {
            let item = this._items[i];
            if (item.equals(regionItem)) {
                this._items.splice(i, 1);
                // poor mans immutability:
                this._items = this._items.slice();
                this._regionState.delete(item.modelId);
                if (item === this.selectedItem) {
                    this.selectedItem = null;
                }
                break;
            }
        }
        if (!this.selectedItem && this._items.length > 0) {
            this.selectedItem = this._items[0];
        }
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
                        this._addToRegionInternal(regionItem);
                    }
                );
            },
            // on remove
            (regionItem: RegionItem) => {
                this._router.runAction(
                    this.modelId,
                    () => {
                        _log.debug(`Removing from region ${regionName}. ${regionItem.toString()}`);
                        this._addToRegionInternal(regionItem);
                    }
                );
            }
        );
        this.addDisposable(() => {
            this._regionManager.unregisterRegion(regionName);
        });
    }
}

// exists for backwards compatibility
export class RegionModelBase extends RegionModel { }