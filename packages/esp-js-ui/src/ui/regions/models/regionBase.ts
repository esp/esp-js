import {isString, Logger} from '../../../core';
import {EspDecoratorUtil, Guard, observeEvent, Router, utils} from 'esp-js';
import {ModelBase} from '../../modelBase';
import {IdFactory} from '../../idFactory';
import {RegionItem} from './regionItem';
import {getViewFactoryMetadataFromModelInstance, StateSaveProviderConsts, StateSaveProviderMetadata, ViewFactoryEntry, ViewFactoryMetadata, ViewRegistryModel, RegionRecordState} from '../../viewFactory';
import {EspUiEventNames} from '../../espUiEventNames';
import {RegionItemRecord} from './regionItemRecord';
import {SelectedItemChangedEvent} from './events';
import {RegionManager} from './regionManager';
import {RegionState} from './regionState';
import {SingleModuleLoader} from '../../modules';
import {SystemContainerConst} from '../../dependencyInjection';
import * as uuid from 'uuid';

const _log = Logger.create('RegionsModelBase');

export enum RegionChangeType {
    /**
     * The record was added via via a non-state-load related operation
     */
    RecordAdded,
    /**
     * The record was added as part of a state load operation
     */
    RecordAddedFromState,
    RecordRemoved,
    RecordUpdated,
    RecordSelected,
}

export abstract class RegionBase<TCustomState = any> extends ModelBase {
    // Helper to kep our underlying state collections immutable.
    // This is really best effort, if a caller modifies this then not much we can do.
    // An additional step would be to always maintain a master copy and expose a public copy, but they perhaps we should just pull in an immutable library
    // At least for now anything that's rendering these lists can rely on the array instance only changing when the data changes.
    private _state = {
        _regionRecordsByRecordId: new Map<string, RegionItemRecord>(),
        _regionRecords: [] as RegionItemRecord[],
        _selectedRecord: null as RegionItemRecord,
        _isUnloading: false,
        get selectedRecord(): RegionItemRecord {
            return this._selectedRecord;
        },
        get regionRecordsById(): Map<string, RegionItemRecord> {
            return this._regionRecordsByRecordId;
        },
        get regionRecords(): RegionItemRecord[] {
            return this._regionRecords;
        },
        has(regionRecordId: string): boolean {
            const regionItemRecord: RegionItemRecord = this.findRecordById(regionRecordId);
            return !!regionItemRecord;
        },
        getByRecordId(id): RegionItemRecord {
            return this._regionRecordsByRecordId.get(id);
        },
        setSelected(item: RegionItemRecord | RegionItem) {
            let record: RegionItemRecord;
            if ('regionRecordId' in item) {
                record = this.findRecordById(item.regionRecordId);
            } else {
                record = item;
            }
            Guard.isTruthy(this._regionRecordsByRecordId.has(record.id), `record not found`);
            this._selectedRecord = record;
        },
        addRecord(record: RegionItemRecord) {
            Guard.isDefined(record, `record must be defined`);
            Guard.isFalsey(this._regionRecordsByRecordId.has(record.id), `record not found`);
            this._regionRecordsByRecordId = new Map<string, RegionItemRecord>(this._regionRecordsByRecordId.set(record.id, record));
            this._setRecordsArrayAndSelectedItem();
        },
        updateRecord(record: RegionItemRecord) {
            Guard.isDefined(record, `record must be defined`);
            this._deleteByRecordId(record.id);
            this.addRecord(record);
        },
        removeByRecordId(id: string): RegionItemRecord {
            Guard.isString(id, `id must be defined and be a string`);
            Guard.isTruthy(this._regionRecordsByRecordId.has(id), `record not found`);
            const record = this._regionRecordsByRecordId.get(id);
            this._deleteByRecordId(record.id);
            this._setRecordsArrayAndSelectedItem();
            return record;
        },
        unload(): RegionItemRecord[] {
            Guard.isFalsey(this._isUnloading, 'Already unloading');
            this._isUnloading = true;
            const removedItems = [];
            this._regionRecordsByRecordId.forEach((regionItemRecord: RegionItemRecord) => {
                regionItemRecord.model.dispose();
                regionItemRecord.dispose();
                removedItems.push(regionItemRecord);
            });
            this._regionRecordsByRecordId = new Map();
            this._setRecordsArrayAndSelectedItem();
            this._isUnloading = false;
            return removedItems;
        },
        _setRecordsArrayAndSelectedItem() {
            this._regionRecords = Array.from<RegionItemRecord>(this._regionRecordsByRecordId.values());
            if (this._regionRecords.length === 0) {
                this._selectedRecord = null;
            } else {
                if (this._selectedRecord) {
                    // will either clear (if it no longer exists) or re-set (if instance has changed)
                    this._selectedRecord = this._regionRecordsByRecordId.get(this._selectedRecord.id);
                }
                let nothingSelected = !!!this._selectedRecord;
                if (nothingSelected) {
                    this._selectedRecord = this._regionRecords[0];
                }
            }
        },
        _deleteByRecordId(id: string) {
            Guard.isTruthy(this._regionRecordsByRecordId.has(id), `record not found`);
            this._regionRecordsByRecordId.delete(id);
            this._regionRecordsByRecordId = new Map<string, RegionItemRecord>(this._regionRecordsByRecordId);
        },
        findRecordById(recordId: string) {
            return Array
                .from<RegionItemRecord>(this._regionRecordsByRecordId.values())
                .find(r => r.modelCreated && r.id === recordId);
        }
    };

    protected constructor(
        protected _regionName : string,
        router: Router,
        protected _regionManager: RegionManager,
        protected _viewRegistry: ViewRegistryModel,
        modelId = IdFactory.createId(`region-${_regionName}`)
    ) {
        super(modelId, router);
        Guard.isString(_regionName, `_regionName required`);
        Guard.isDefined(router, `router required`);
        Guard.isDefined(_regionManager, `_regionManager required`);
        Guard.isDefined(_viewRegistry, `_viewRegistry required`);
    }

    protected get state() {
        return this._state;
    }

    public abstract get stateSavingEnabled(): boolean;

    /**
     * A version which will be associated with any state saved for this region.
     */
    public get stateVersion() {
        return 1;
    }

    public get name() {
        return this._regionName;
    }

    /**
     * Returns the underlying models currently registered with the region (keyed by modelId).
     *
     * This is useful if you need to readonly query them (perhaps to save state).
     * You should not modify these, if you meed to modify raise an event to the model via the Router.
     */
    public get regionRecords(): RegionItemRecord[] {
        return this._state.regionRecords;
    }

    public get selectedRecord(): RegionItemRecord {
        return this._state.selectedRecord;
    }

    public observeEvents() {
        super.observeEvents();
        _log.verbose('starting. Adding model and observing events');
        this._registerWithRegionManager(this._regionName);
    }

    public getRegionState(): RegionState<TCustomState> {
        const regionRecordStates =  Array
            .from(this._state.regionRecordsById.values())
            .map<RegionRecordState>(regionItemRecord => this.getRegionRecordState(regionItemRecord) )
            .filter(c => c != null);
        return {
            regionName: this._regionName,
            stateVersion: this.stateVersion,
            customState: this.createCustomState(),
            regionRecordStates: regionRecordStates,
        };
    }

    /**
     * Creates a TCustomState which stores any additional data a derived type may want to store for this region.
     *
     */
    protected createCustomState(): TCustomState {
        return null;
    }

    /**
     * Called any time a RegionItemRecord is added/removed and/or if the RegionItemRecord 'model creation' state changes (i.e. the record is updated)
     * @param type
     * @param change
     */
    protected onStateChanged(type: RegionChangeType, change: RegionItemRecord) {

    }

    public existsInRegionByModelId(modelId: string): boolean {
        return this._state.regionRecords
            .filter(r => r.modelCreated)
            .some(r => r.modelId === modelId);
    }

    public existsInRegionByRecordId(regionRecordId: string): boolean {
        return this._state.regionRecordsById.has(regionRecordId);
    }

    public existsInRegionByRegionItem(regionItem: RegionItem): boolean {
        return this._state.regionRecordsById.has(regionItem.regionRecordId);
    }

    public existsInRegion(predicate: (regionItemRecord: RegionItemRecord) => boolean): boolean {
        // This is read only hence can perform the call on any dispatch loop
        for (let x of this._state.regionRecordsById.values()) {
            const match = predicate(x);
            if (match) {
                return true;
            }
        }
        return false;
    }

    @observeEvent(EspUiEventNames.regions_selectedItemChanged)
    private _onRegionSelectedItemChanged(ev: SelectedItemChangedEvent) {
        this.setSelected(ev.regionItemRecord);
    }

    /**
     * Set the selected item
     * @param item: a RegionItemRecord, RegionItem or a string representing the RegionItemRecord.id
     */
    public setSelected(item: RegionItemRecord | string) {
        if (!this.isOnDispatchLoop()) {
            this.setSelected(item);
            return;
        }
        if (isString(item)) {
            item = this._state.findRecordById(item);
        }
        this._state.setSelected(item);
        this.onStateChanged(RegionChangeType.RecordSelected, item);
    }

    /**
     * @deprecated use addToRegion
     */
    public addRegionItem(regionItem: RegionItem): void {
        this.addToRegion(regionItem);
    }

    public addToRegion(regionItem: RegionItem): void {
        if (!this.isOnDispatchLoop()) {
            this.ensureOnDispatchLoop(() => this.addRegionItem(regionItem));
            return;
        }
        _log.debug(`Adding to region ${this._regionName}. ${regionItem.toString()}`);
        Guard.isFalsey(this._state.has(regionItem.regionRecordId), `Model ${regionItem.modelId} already in region against region record ${regionItem.regionRecordId}`);
        // We get the initial model and store a reference to it.
        // In esp the top level model instance never changes.
        // This is true even for immutable models, they always have a parent that doesn't change, the store that hangs off that parent will change.
        let model = this._router.getModel(regionItem.modelId);
        const viewFactoryMetadata: ViewFactoryMetadata = getViewFactoryMetadataFromModelInstance(model);
        const viewFactoryEntry = this._viewRegistry.getViewFactoryEntry(viewFactoryMetadata.viewKey);
        let regionItemRecord = RegionItemRecord.createForExistingItem(regionItem.regionRecordId, viewFactoryEntry, model, regionItem.displayOptions);
        this._addRegionRecord(regionItemRecord);
    }

    /**
     * @deprecated use removeFromRegion
     */
    public removeRegionItem(regionItem: RegionItem): void {
        this.removeFromRegion(regionItem);
    }

    public removeFromRegion(regionRecordId: string): void;
    public removeFromRegion(regionItem: RegionItem): void;
    public removeFromRegion(...args: (string|RegionItem)[]): void {
        if (!this.isOnDispatchLoop()) {
            this.ensureOnDispatchLoop(() => this._removeFromRegion(args));
            return;
        }
        this._removeFromRegion(args);
    }

    // I have to pull this out as typescript overloads don't allow for a reentrant call as is required via the `isOnDispatchLoop` check.
    private _removeFromRegion(args: (string|RegionItem)[]): void {
        let regionRecordId: string;
        if (typeof args[0] === 'string') {
            regionRecordId = <string>args[0];
        } else {
            regionRecordId = (<RegionItem>args[0]).regionRecordId;
        }
        let regionItemRecord = this._state.findRecordById(regionRecordId);
        this._removeRegionRecord(regionItemRecord);
    }

    private _addRegionRecord(regionItemRecord: RegionItemRecord, recordState?: RegionRecordState): RegionItemRecord {
        if (!regionItemRecord.modelCreated) {
            _log.debug(`Region ${this._regionName}. Adding record [${regionItemRecord.toString()}]. Model not created so will wait for it's module to load.`);
            const singleModuleLoader = regionItemRecord.viewFactoryEntry.container.resolve<SingleModuleLoader>(SystemContainerConst.single_module_loader);
            if (singleModuleLoader.hasLoaded) {
                const model = regionItemRecord.viewFactoryEntry.factory.createView(recordState);
                regionItemRecord = regionItemRecord.update(model);
            } else {
                regionItemRecord.addDisposable(singleModuleLoader.loadResults
                    .filter(lr => lr.hasCompletedLoaded)
                    .take(1)
                    .subscribeWithRouter(
                        this.router,
                        this.modelId,
                        () => {
                            _log.debug(`Region [${this._regionName}]. Model now created for record [${regionItemRecord.toString()}].`);
                            const model = regionItemRecord.viewFactoryEntry.factory.createView(recordState);
                            regionItemRecord = regionItemRecord.update(model);
                            this._state.updateRecord(regionItemRecord);
                            this.onStateChanged(RegionChangeType.RecordUpdated, regionItemRecord);
                        },
                        (err: any) => {
                            _log.error(`Region [${this._regionName}]. Error waiting for module to load inorder to create view from factory ${recordState.viewFactoryKey}, record [${regionItemRecord.toString()}].`, err);
                            // flag view as error
                        }
                    )
                );
            }
        } else {
            _log.debug(`Region ${this._regionName}. Adding record [${regionItemRecord.toString()}].`);
        }
        this._state.addRecord(regionItemRecord);
        if (recordState && recordState.isSelected) {
            this._state.setSelected(regionItemRecord);
        }
        const changeType = recordState ? RegionChangeType.RecordAddedFromState : RegionChangeType.RecordAdded;
        this.onStateChanged(changeType, regionItemRecord);
        return regionItemRecord;
    }

    private _removeRegionRecord(regionItemRecord: RegionItemRecord): void {
        _log.debug(`Region ${this._regionName}. Removing record [${regionItemRecord.toString()}].`);
        this._state.removeByRecordId(regionItemRecord.id);
        this.onStateChanged(RegionChangeType.RecordRemoved, regionItemRecord);
    }

    protected getRegionRecordState(regionItemRecord: RegionItemRecord): RegionRecordState {
        if (!regionItemRecord.modelCreated) {
            // If the model isn't created yet for some reason, we just return any initial associated with the item as that's effectively the current state.
            return regionItemRecord.initialRecordState; // might be null, that's ok
        }

        if (regionItemRecord.viewFactoryEntry.isLegacyViewFactory) {
            // If the view was created by an older version of esp it won't support state being saved in regions.
            // The old state code relied on the modules saved state for views.
            return null;
        }

        const model = regionItemRecord.model;
        let viewState: any = null;
        // try see if there was a @stateProvider decorator on the views model,
        // if so invoke the function it was declared on to get the state.
        if (EspDecoratorUtil.hasMetadata(model)) {
            const metadata: StateSaveProviderMetadata = EspDecoratorUtil.getCustomData(model, StateSaveProviderConsts.CustomDataKey);
            if (metadata) {
                viewState = model[metadata.functionName]();
            }
        }
        if (!viewState) {
            // else see if there is a function with name StateSaveProviderConsts.HandlerFunctionName
            const stateProviderFunction = model[StateSaveProviderConsts.HandlerFunctionName];
            if (stateProviderFunction && utils.isFunction(stateProviderFunction)) {
                viewState= stateProviderFunction.call(model);
            }
        }
        if (viewState) {
            return {
                viewFactoryKey: regionItemRecord.viewFactoryMetadata.viewKey,
                stateVersion: regionItemRecord.viewFactoryMetadata.stateVersion,
                regionRecordId: regionItemRecord.id,
                viewState: viewState,
                isSelected: this.selectedRecord.id === regionItemRecord.id
            };
        }
        return null;
    }

    public load(regionState: RegionState<TCustomState>)  {
        Guard.isDefined(regionState, `regionState not defined`);
        Guard.isArray(regionState.regionRecordStates, `regionState.regionRecordStates is not an array`);
        this.ensureOnDispatchLoop(() => {
            _log.debug(`Region ${this._regionName}. Loading state. Item count: ${regionState.regionRecordStates.length}.`);
            regionState.regionRecordStates.forEach((recordState: RegionRecordState) => {
                this.loadView(recordState);
            });
        });
    }

    public unload() {
        if (!this.isOnDispatchLoop()) {
            this.ensureOnDispatchLoop(() => this.unload());
            return;
        }
        _log.debug(`Region ${this._regionName}. Unloading.`);
        const unloadedItems = this._state.unload();
        unloadedItems.forEach(record => {
            this.onStateChanged(RegionChangeType.RecordRemoved, record);
        });
    }

    protected loadView(recordState: RegionRecordState): RegionItemRecord {
        Guard.isTruthy(this._router.isOnDispatchLoopFor(this.modelId), `Protected methods should be called on correct dispatch loop`);
        // At this point the view factories should have been loaded, however each module may not have finished loading.
        // ViewFactories assume the module is loaded, it would be complicated to push this concern to them, really that's a higher level concern.
        // The only mid ground is the regions whereby they can try load views for modules that are ready and show some spinning UI for views belonging to modules that are not ready.
        // We have to do that here and model it via RegionItem.
        if (this._viewRegistry.hasViewFactory(recordState.viewFactoryKey)) {
            const viewFactoryEntry: ViewFactoryEntry = this._viewRegistry.getViewFactoryEntry(recordState.viewFactoryKey);
            let regionRecordId = recordState.regionRecordId || uuid.v4();
            const regionItemRecord = RegionItemRecord.createForStateLoadedItem(regionRecordId, viewFactoryEntry, recordState);
            this._addRegionRecord(regionItemRecord, recordState);
            return regionItemRecord;
        } else {
            // It's possible the component factory isn't loaded, perhaps old state had a component which the users currently isn't entitled to see ATM.
            _log.warn(`Skipping load for view as it's factory of type [${recordState.viewFactoryKey}] is not registered`);
            return null;
        }
    }

    private _registerWithRegionManager(regionName) {
        this._regionManager.registerRegion(regionName, this,);
        this.addDisposable(() => {
            this._regionManager.unregisterRegion(regionName);
        });
    }
}