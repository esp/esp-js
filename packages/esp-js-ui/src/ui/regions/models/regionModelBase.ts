import {isString, Logger} from '../../../core';
import {EspDecoratorUtil, Guard, observeEvent, Router, utils} from 'esp-js';
import {ModelBase} from '../../modelBase';
import {IdFactory} from '../../idFactory';
import {RegionItem} from './regionItem';
import {getViewFactoryMetadataFromModelInstance, StateSaveProviderConsts, StateSaveProviderMetadata, ViewFactoryEntry, ViewFactoryMetadata, ViewRegistryModel, ViewState} from '../../viewFactory';
import {EspUiEventNames} from '../../espUiEventNames';
import {RegionItemRecord} from './regionItemRecord';
import {SelectedItemChangedEvent} from './events';
import {RegionManager} from './regionManager';

const _log = Logger.create('RegionsModelBase');
let _modelIdSeed = 1;

export interface RegionState {
    regionName: string;
    /**
     * Provides a version for the regions state.
     * You can set this to 1 until you need to change.
     * At some future point, you may modify the regions state model and need to migrate state from an older version to a newer one.
     * You'd typically do this by overriding the call to `region.getRegionState(regionState)`
     */
    stateVersion: number;
    viewState: ViewState<any>[];
}

export interface Region {
    modelId: string;
    items: RegionItem[];
    selectedItem: RegionItem;
    addRegionItem(regionItem: RegionItem);
    removeRegionItem(regionItem: RegionItem);
    existsInRegion(modelId: string): boolean;
    existsInRegion(predicate: (regionItemRecord: RegionItemRecord) => boolean): boolean;
    getRegionState(): RegionState;
    load(regionState: RegionState): void;
    unload(): void;
}

export abstract class RegionModelBase<TRegionState extends RegionState> extends ModelBase implements Region {
    // Helper to kep our underlying state collections immutable.
    // This is really best effort, if a caller modifies this then not much we can do.
    // An additional step would be to always maintain a master copy and expose a public copy, but they perhaps we should just pull in an immutable library
    // At least for now anything that's rendering these lists can rely on the array instance only changing when the data changes.
    private _state = {
        _regionRecords: new Map<string, RegionItemRecord>(),
        _regionItems: [] as RegionItem[],
        _selectedItem: null as RegionItem,
        _isUnloading: false,
        get selectedItem(): RegionItem {
            return this._selectedItem;
        },
        get regionRecords(): Map<string, RegionItemRecord> {
            return this._regionRecords;
        },
        get regionItems(): RegionItem[] {
            return this._regionItems;
        },
        has(modelId): boolean {
            return this._regionRecords.has(modelId);
        },
        get(modelId): RegionItemRecord {
            return this._regionRecords.get(modelId);
        },
        setSelectedItem(item: RegionItem) {
            if (this._regionRecords.has(item.modelId)) {
                this._selectedItem = this._regionRecords.get(item.modelId);
            }
        },
        addRecord(record: RegionItemRecord) {
            this._regionRecords = new Map<string, RegionItemRecord>(this._regionRecords.set(record.regionItem.modelId, record));
            this._setItemsArrayAndSelectedItem();
        },
        removeRecord(modelId: string) {
            if (this._regionRecords.delete(modelId)) {
                this._regionRecords = new Map<string, RegionItemRecord>(this._regionRecords);
                this._setItemsArrayAndSelectedItem();
            }
        },
        reset() {
            this._regionRecords = new Map();
            this._setItemsArrayAndSelectedItem();
        },
        unload() {
            Guard.isFalsey(this._isUnloading, 'Already unloading');
            this._isUnloading = true;
            this._regionRecords.forEach((regionItemRecord: RegionItemRecord) => {
                regionItemRecord.model.dispose();
            });
            this._regionRecords = new Map();
            this._setItemsArrayAndSelectedItem();
            this._isUnloading = false;
        },
        _setItemsArrayAndSelectedItem() {
            this._regionItems = Array.from(this._regionRecords.values()).map(r => (<RegionItemRecord>r).regionItem);
            if (this._selectedItem && !this._regionRecords.has(this._selectedItem.modelId)) {
                this._selectedItem = null;
            }
            if (this._selectedItem === null && this._regionItems.length > 0) {
                this._selectedItem = this._regionItems[0];
            }
        }
    };

    protected get state() {
        return this._state;
    }

    public get selectedItem(): RegionItem {
        return this._state.selectedItem;
    }

    protected constructor(
        protected _regionName : string,
        router: Router,
        protected _regionManager: RegionManager,
        protected _viewRegistry: ViewRegistryModel,
    ) {
        super(IdFactory.createId(`region#${++_modelIdSeed}`), router);
    }

    /**
     * A version which will be associated with any state saved for this region.
     */
    public get stateVersion() {
        return 1;
    }

    public get items(): RegionItem[] {
        return this._state.regionItems;
    }

    /**
     * Returns the underlying models currently registered with the region (keyed by modelId).
     *
     * This is useful if you need to readonly query them (perhaps to save state).
     * You should not modify these, if you meed to modify raise an event to the model via the Router.
     */
    protected get regionRecords(): Map<string, RegionItemRecord> {
        return this._state.regionRecords;
    }

    public getTitle(): string {
        return '';
    }

    public reset() {
        this._state.reset();
    }

    public observeEvents() {
        super.observeEvents();
        _log.verbose('starting. Adding model and observing events');
        this._registerWithRegionManager(this._regionName);
    }

    private _registerWithRegionManager(regionName) {
        this._regionManager.registerRegion(
            regionName,
            this,
        );
        this.addDisposable(() => {
            this._regionManager.unregisterRegion(regionName);
        });
    }

    @observeEvent(EspUiEventNames.regions_multiItemRegion_selectedItemChanged)
    private _observeSelectedItemChanged(ev: SelectedItemChangedEvent) {
        this._state.setSelectedItem(ev.selectedItem);
    }

    public addRegionItem(regionItem: RegionItem): void {
        if (!this.isOnDispatchLoop()) {
            this.ensureOnDispatchLoop(() => this.addRegionItem(regionItem));
            return;
        }
        _log.debug(`Adding to region ${this._regionName}. ${regionItem.toString()}`);
        Guard.isFalsey(this._state.has(regionItem.modelId), `Model ${regionItem.modelId} already in region`);
        this._state.addRecord(
            { viewFactoryMetadata: null, model: null, regionItem}
        );
        this._router.getModelObservable<any>(regionItem.modelId).subscribe(model => {
            this._router.runAction(this.modelId, () => {
                const viewFactoryMetadata: ViewFactoryMetadata = getViewFactoryMetadataFromModelInstance(model);
                const regionItemRecord = this._state.get(regionItem.modelId);
                // We code a bit defensively here as the model could be added later, perhaps code removed it from a region by this point.
                if (regionItemRecord) {
                    regionItemRecord.model = model;
                    regionItemRecord.viewFactoryMetadata = viewFactoryMetadata;
                }
            });
        });
    }

    public removeRegionItem(regionItem: RegionItem): void {
        if (!this.isOnDispatchLoop()) {
            this.ensureOnDispatchLoop(() => this.removeRegionItem(regionItem));
            return;
        }
        _log.debug(`Removing from region ${this._regionName}. ${regionItem.toString()}`);
        this._state.removeRecord(regionItem.modelId);
    }

    public existsInRegion(modelId: string): boolean;
    public existsInRegion(predicate: (regionItemRecord: RegionItemRecord) => boolean): boolean;
    public existsInRegion(...args: any[]): boolean {
        if (isString(args[0])) {
            return this._state.regionRecords.has(args[0]);
        }  else {
            let predicate: (regionItemRecord: RegionItemRecord) => boolean = args[0];
            for (let x of this._state.regionRecords.values()) {
                const match = predicate(x);
                if (match) {
                    return true;
                }
            }
        }
        return false;
    }

    public abstract getRegionState(): TRegionState;

    protected getViewState(regionItemRecord: RegionItemRecord): ViewState<any> {
        const model = regionItemRecord.model;
        // try see if there was a @stateProvider decorator on the views model,
        // if so invoke the function it was declared on to get the state.
        if (EspDecoratorUtil.hasMetadata(regionItemRecord)) {
            const metadata: StateSaveProviderMetadata = EspDecoratorUtil.getCustomData(model, StateSaveProviderConsts.CustomDataKey);
            if (metadata) {
                const viewState = model[metadata.functionName]();
                return {
                    viewFactoryKey: regionItemRecord.viewFactoryMetadata.viewKey,
                    stateVersion: regionItemRecord.viewFactoryMetadata.stateVersion,
                    state: viewState
                };
            }
        }
        // else see if there is a function with name StateSaveProviderConsts.HandlerFunctionName
        const stateProviderFunction = model[StateSaveProviderConsts.HandlerFunctionName];
        if (stateProviderFunction && utils.isFunction(stateProviderFunction)) {
            const viewState = stateProviderFunction.call(model);
            return {
                viewFactoryKey: regionItemRecord.viewFactoryMetadata.viewKey,
                stateVersion: regionItemRecord.viewFactoryMetadata.stateVersion,
                state: viewState
            };
        }
        return null;
    }

    public load(regionState: TRegionState) {
        if (regionState) {
            regionState.viewState.forEach((viewState: ViewState<any>) => {
                if (this._viewRegistry.hasViewFactory(viewState.viewFactoryKey)) {
                    const viewFactoryEntry: ViewFactoryEntry = this._viewRegistry.getViewFactoryEntry(viewState.viewFactoryKey);
                    const viewModel = viewFactoryEntry.factory.createView(viewState);
                    const regionItem = new RegionItem(viewModel.modelId);
                    this.addRegionItem(regionItem);
                } else {
                    // It's possible the component factory isn't loaded, perhaps old state had a component which the users currently isn't entitled to see ATM.
                    _log.warn(`Skipping load for view as it's factory of type [${viewState.viewFactoryKey}] is not registered`);
                }
            });
        }
    }

    public unload() {
        this._state.unload();
    }
}