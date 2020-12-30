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
import {RegionState} from './regionState';
import {SingleModuleLoader} from '../../modules';
import {SystemContainerConst} from '../../dependencyInjection';
import * as uuid from 'uuid';

const _log = Logger.create('RegionsModelBase');
let _modelIdSeed = 1;

export enum RegionChangeType {
    RecordAdded,
    RecordRemoved,
    RecordUpdated,
    RecordSelected,
}

export interface RegionChangedState<TViewState extends ViewState<object>> {
    added?: RegionItemRecordWithState<TViewState> | RegionItemRecord;
    removed?: RegionItemRecord;
    updated?: RegionItemRecord;
    selected: RegionItemRecord;
}

export interface RegionItemRecordWithState<TViewState extends ViewState<object>> {
    record: RegionItemRecord;
    viewState: TViewState;
}

export namespace RegionItemRecordWithState {
    export const isRegionItemRecordWithState = <TViewState extends ViewState<object>>(obj: RegionItemRecordWithState<TViewState> | RegionItemRecord): obj is RegionItemRecordWithState<TViewState> => {
        return 'viewState' in obj && 'record' in obj;
    };
}

export abstract class RegionBase<TViewState extends ViewState<object>, TRegionState extends RegionState<TViewState>> extends ModelBase {
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
    ) {
        super(IdFactory.createId(`region-${_regionName}-${++_modelIdSeed}`), router);
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

    public abstract getRegionState(): TRegionState;

    protected onStateChanged(type: RegionChangeType, change: RegionChangedState<TViewState>) {

    }

    public existsInRegion(modelId: string): boolean;
    public existsInRegion(predicate: (regionItemRecord: RegionItemRecord) => boolean): boolean;
    public existsInRegion(...args: any[]): boolean {
        // This is read only hence can perform the call on any dispatch loop
        if (isString(args[0])) {
            return this._state.regionRecordsById.has(args[0]);
        }  else {
            let predicate: (regionItemRecord: RegionItemRecord) => boolean = args[0];
            for (let x of this._state.regionRecordsById.values()) {
                const match = predicate(x);
                if (match) {
                    return true;
                }
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
    public setSelected(item: RegionItemRecord | RegionItem | string) {
        if (!this.isOnDispatchLoop()) {
            this.setSelected(item);
            return;
        }
        if (isString(item)) {
            item = this._state.findRecordById(item);
        }
        this._state.setSelected(item);
        this.onStateChanged(RegionChangeType.RecordSelected, { selected: this._state.selectedRecord });
    }

    public addRegionItem(regionItem: RegionItem): void {
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
        let regionItemRecord = new RegionItemRecord(regionItem, viewFactoryMetadata, model);
        this._addRegionRecord(regionItemRecord);
    }

    public removeRegionItem(regionItem: RegionItem): void {
        if (!this.isOnDispatchLoop()) {
            this.ensureOnDispatchLoop(() => this.removeRegionItem(regionItem));
            return;
        }
        let regionItemRecord = this._state.findRecordById(regionItem.regionRecordId);
        this._removeRegionRecord(regionItemRecord);
    }

    private _addRegionRecord(regionItemRecord: RegionItemRecord, state?: TViewState): RegionItemRecord {
        if (!regionItemRecord.modelCreated) {
            _log.debug(`Region ${this._regionName}. Adding record [${regionItemRecord.toString()}]. Model not created so will wait for it's module to load.`);
            const singleModuleLoader = regionItemRecord.viewFactoryEntry.container.resolve<SingleModuleLoader>(SystemContainerConst.single_module_loader);
            if (singleModuleLoader.hasLoaded) {
                const model = regionItemRecord.viewFactoryEntry.factory.createView(state);
                regionItemRecord = regionItemRecord.update(regionItemRecord.viewFactoryEntry.factory.metadata, model);
            } else {
                regionItemRecord.addDisposable(singleModuleLoader.loadResults
                    .filter(lr => lr.hasCompletedLoaded)
                    .take(1)
                    .subscribeWithRouter(
                        this.router,
                        this.modelId,
                        () => {
                            _log.debug(`Region [${this._regionName}]. Model now created for record [${regionItemRecord.toString()}].`);
                            const model = regionItemRecord.viewFactoryEntry.factory.createView(state);
                            regionItemRecord = regionItemRecord.update(regionItemRecord.viewFactoryEntry.factory.metadata, model);
                            this._state.updateRecord(regionItemRecord);
                            this.onStateChanged(RegionChangeType.RecordUpdated, {updated: regionItemRecord, selected: this._state.selectedRecord});
                        },
                        (err: any) => {
                            _log.error(`Region [${this._regionName}]. Error waiting for module to load inorder to create view from factory ${state.viewFactoryKey}, record [${regionItemRecord.toString()}].`, err);
                            // flag view as error
                        }
                    )
                );
            }
        } else {
            _log.debug(`Region ${this._regionName}. Adding record [${regionItemRecord.toString()}].`);
        }
        this._state.addRecord(regionItemRecord);
        const added: RegionItemRecordWithState<TViewState> | RegionItemRecord = state
            ? { record: regionItemRecord, viewState: state }
            : regionItemRecord;
        this.onStateChanged(RegionChangeType.RecordAdded, {added: added, selected: this._state.selectedRecord});
        return regionItemRecord;
    }

    private _removeRegionRecord(regionItemRecord: RegionItemRecord): void {
        _log.debug(`Region ${this._regionName}. Removing record [${regionItemRecord.toString()}].`);
        this._state.removeByRecordId(regionItemRecord.id);
        this.onStateChanged(RegionChangeType.RecordRemoved, {removed: regionItemRecord, selected: this._state.selectedRecord});
    }

    protected getViewState(regionItemRecord: RegionItemRecord): TViewState {
        if (!regionItemRecord.modelCreated) {
            return null;
        }
        const model = regionItemRecord.model;
        let viewState: TViewState = null;
        // try see if there was a @stateProvider decorator on the views model,
        // if so invoke the function it was declared on to get the state.
        if (EspDecoratorUtil.hasMetadata(regionItemRecord)) {
            const metadata: StateSaveProviderMetadata = EspDecoratorUtil.getCustomData(model, StateSaveProviderConsts.CustomDataKey);
            if (metadata) {
                const modelState = model[metadata.functionName]();
                viewState = this.createViewState(regionItemRecord, modelState);
                this._ensureViewStateBasePropertiesSet(viewState);
            }
        } else {
            // else see if there is a function with name StateSaveProviderConsts.HandlerFunctionName
            const stateProviderFunction = model[StateSaveProviderConsts.HandlerFunctionName];
            if (stateProviderFunction && utils.isFunction(stateProviderFunction)) {
                const modelState = stateProviderFunction.call(model);
                viewState = this.createViewState(regionItemRecord, modelState);
            }
        }
        if (viewState) {
            this._ensureViewStateBasePropertiesSet(viewState);
        }
        return viewState;
    }

    private _ensureViewStateBasePropertiesSet(viewState: TViewState) {
        Guard.isString(viewState.viewFactoryKey, `Region [${this._regionName}] createViewState() override did not set ViewState.viewFactoryKey`);
        Guard.isString(viewState.regionRecordId, `Region [${this._regionName}] createViewState() override did not set ViewState.regionRecordId`);
        Guard.isNumber(viewState.stateVersion, `Region [${this._regionName}] createViewState() override did not set ViewState.stateVersion`);
    }
    /**
     * Creates a specialised ViewState object,
     *
     * Note you can pull may of the required items from the given regionItem Record:
     *
     * ```
     * return {
     *     ...viewState, // custom parts
     *     stateVersion: regionItemRecord.viewFactoryMetadata.stateVersion,
     *     viewFactoryKey: regionItemRecord.viewFactoryEntry.viewFactoryKey,
     *     regionRecordId: regionItemRecord.id,
     * };
     * ```
     * @param regionItemRecord
     * @param modelState
     */
    protected abstract createViewState(regionItemRecord: RegionItemRecord, modelState): TViewState;

    public load(regionState: TRegionState)  {
        Guard.isDefined(regionState, `regionState not defined`);
        Guard.isArray(regionState.viewState, `regionState.viewState is not an array`);
        this.ensureOnDispatchLoop(() => {
            _log.debug(`Region ${this._regionName}. Loading state. View count: ${regionState.viewState.length}.`);
            const addedRecords = [];
            regionState.viewState.forEach((viewState: TViewState) => {
                addedRecords.push(this._loadView(viewState));
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
            this.onStateChanged(RegionChangeType.RecordRemoved, {removed: record, selected: this._state.selectedRecord});
        });
    }

    private _loadView(viewState: TViewState): RegionItemRecord {
        Guard.isTruthy(this._router.isOnDispatchLoopFor(this.modelId), `Protected methods should be called on correct dispatch loop`);
        // At this point the view factories should have been loaded, however each module may not have finished loading.
        // ViewFactories assume the module is loaded, it would be complicated to push this concern to them, really that's a higher level concern.
        // The only mid ground is the regions whereby they can try load views for modules that are ready and show some spinning UI for views belonging to modules that are not ready.
        // We have to do that here and model it via RegionItem.
        if (this._viewRegistry.hasViewFactory(viewState.viewFactoryKey)) {
            const viewFactoryEntry: ViewFactoryEntry = this._viewRegistry.getViewFactoryEntry(viewState.viewFactoryKey);
            let regionRecordId = viewState.regionRecordId || uuid.v4();
            const regionItemRecord = new RegionItemRecord(regionRecordId, viewFactoryEntry);
            this._addRegionRecord(regionItemRecord, viewState);
            return regionItemRecord;
        } else {
            // It's possible the component factory isn't loaded, perhaps old state had a component which the users currently isn't entitled to see ATM.
            _log.warn(`Skipping load for view as it's factory of type [${viewState.viewFactoryKey}] is not registered`);
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