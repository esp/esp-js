import { Logger } from '../../../core';
import {EspDecoratorUtil, Guard, observeEvent, Router, utils} from 'esp-js';
import {ModelBase} from '../../modelBase';
import {IdFactory} from '../../idFactory';
import {RegionManager, ViewCallBack} from '../regionManager';
import {RegionItem} from './regionItem';
import {getViewFactoryMetadataFromModelInstance, StateSaveProviderConsts, StateSaveProviderMetadata, ViewFactoryMetadata} from '../../viewFactory';
import {EspUiEventNames} from '../../espUiEventNames';
import {RegionItemRecord} from './regionItemRecord';
import {SelectedItemChangedEvent} from './events';
import {Region, RegionState} from './regionManager';
import {ViewFactoryState} from '../../modules/module';
import {ViewState} from '../../modules';

const _log = Logger.create('RegionsModelBase');
let _modelIdSeed = 1;

export class RegionModel extends ModelBase implements Region {
    private _regionRecords = new Map<string, RegionItemRecord>();
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
     * A version which will be associated with any state saved for this view factory.
     */
    public get stateVersion() {
        return 1;
    }

    /**
     * Returns the underlying models currently registered with the region.
     *
     * This is useful if you need to readonly query them (perhaps to save state).
     * You should not modify these, if you meed to modify raise an event to the model via the Router.
     */
    protected get regionRecords(): Map<string, RegionItemRecord> {
        return new Map(this._regionRecords);
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
        this._regionRecords = new Map();
        this._items = [];
        this.selectedItem = null;
    }

    public getRegionState(): RegionState {
        let state = Array
            .from(this._regionRecords)
            .map<ViewState>(([modelId, regionItemRecord]) => {
                let model = regionItemRecord.model;
                // try see if there was a @stateProvider decorator on the views model,
                // if so invoke the function it was declared on to get the state.

                if (EspDecoratorUtil.hasMetadata(regionItemRecord)) {
                    let metadata: StateSaveProviderMetadata = EspDecoratorUtil.getCustomData(model, StateSaveProviderConsts.CustomDataKey);
                    if (metadata) {
                        return {
                            viewFactoryKey: regionItemRecord.viewFactoryMetadata.viewKey,
                            stateVersion: regionItemRecord.viewFactoryMetadata.stateVersion,
                            state: model[metadata.functionName]()
                        };
                    }
                }
                // else see if there is a function with name StateSaveProviderConsts.HandlerFunctionName
                let stateProviderFunction = model[StateSaveProviderConsts.HandlerFunctionName];
                if (stateProviderFunction && utils.isFunction(stateProviderFunction)) {
                    return {
                        viewFactoryKey: regionItemRecord.viewFactoryMetadata.viewKey,
                        stateVersion: regionItemRecord.viewFactoryMetadata.stateVersion,
                        state: stateProviderFunction.call(model)
                    };
                }
                return null;
            })
            .filter(c => c != null);
        if (state.length === 0) {
            return null;
        } else {
            return {
                regionName: this._regionName,
                stateVersion: this.stateVersion,
                viewState: state,
            };
        }
    }

    @observeEvent(EspUiEventNames.regions_multiItemRegion_selectedItemChanged)
    private _observeSelectedItemChanged(ev: SelectedItemChangedEvent) {
        this.selectedItem = ev.selectedItem;
    }

    public addRegionItem(regionItem: RegionItem): void {
        if (!this.isOnDispatchLoop()) {
            this.ensureOnDispatchLoop(() => this.addRegionItem(regionItem));
            return;
        }
        _log.debug(`Adding to region ${this._regionName}. ${regionItem.toString()}`);
        Guard.isFalsey(this._regionRecords.has(regionItem.modelId), `Model ${regionItem.modelId} already in region`);
        this._router.getModelObservable<any>(regionItem.modelId).subscribe(model => {
            this._router.runAction(this.modelId, () => {
                let viewFactoryMetadata: ViewFactoryMetadata = getViewFactoryMetadataFromModelInstance(model);
                let regionItemRecord = this._regionRecords.get(regionItem.modelId);
                // We code a bit defensively here as the model could be added later, perhaps code removed it from a region by this point.
                if (regionItemRecord) {
                    regionItemRecord.model = model;
                    regionItemRecord.viewFactoryMetadata = viewFactoryMetadata;
                }
            });
        });
        this._regionRecords.set(
            regionItem.modelId,
            { viewFactoryMetadata: null, model: null, regionItem}
        );
        // for historical reasons we also maintain an array of RegionItems
        let copy = this._items.slice();
        copy.push(regionItem);
        this._items = copy;

        this._tryDefaultSelectedItem();
    }

    public removeRegionItem(regionItem: RegionItem): void {
        if (!this.isOnDispatchLoop()) {
            this.ensureOnDispatchLoop(() => this.removeRegionItem(regionItem));
            return;
        }
        _log.debug(`Removing from region ${this._regionName}. ${regionItem.toString()}`);
        for (let i = this._items.length; i--;) {
            let item = this._items[i];
            if (item.equals(regionItem)) {
                this._items.splice(i, 1);
                // poor mans immutability:
                this._items = this._items.slice();
                this._regionRecords.delete(item.modelId);
                if (item === this.selectedItem) {
                    this.selectedItem = null;
                }
                break;
            }
        }
        this._tryDefaultSelectedItem();
    }

    private _registerWithRegionManager(regionName) {
        this._regionManager.registerRegion(
            regionName,
            this,
            // // on add
            // (regionItem: RegionItem) => {
            //     this._router.runAction(
            //         this.modelId,
            //         () => {
            //             _log.debug(`Adding to region ${regionName}. ${regionItem.toString()}`);
            //             this._addToRegionInternal(regionItem);
            //         }
            //     );
            // },
            // // on remove
            // (regionItem: RegionItem) => {
            //     this._router.runAction(
            //         this.modelId,
            //         () => {
            //             _log.debug(`Removing from region ${regionName}. ${regionItem.toString()}`);
            //             this._addToRegionInternal(regionItem);
            //         }
            //     );
            // }
        );
        this.addDisposable(() => {
            this._regionManager.unregisterRegion(regionName);
        });
    }

    private _tryDefaultSelectedItem() {
        if (!this.selectedItem && this._items.length > 0) {
            this.selectedItem = this._items[0];
        }
    }
}

// exists for backwards compatibility
export class RegionModelBase extends RegionModel { }