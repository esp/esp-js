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

const _log = Logger.create('RegionsModelBase');
let _modelIdSeed = 1;

export abstract class RegionBase<TRegionState extends RegionState = RegionState> extends ModelBase {
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
        has(item: RegionItem): boolean {
            const regionItemRecord: RegionItemRecord = this.findByRecordRegionItemId(item.id);
            return !!regionItemRecord;
        },
        getByRecordId(id): RegionItemRecord {
            return this._regionRecordsByRecordId.get(id);
        },
        setSelected(item: RegionItemRecord | RegionItem) {
            let record: RegionItemRecord;
            if ('regionItem' in item) {
                record = item;
            } else {
                record = this.findByRecordRegionItemId(item.id);
            }
            Guard.isTruthy(this._regionRecordsByRecordId.has(record.id), `record not found`);
            this._selectedRecord = record;
        },
        addRecord(record: RegionItemRecord) {
            Guard.isDefined(record, `record must be defined`);
            Guard.isFalsey(this._regionRecordsByRecordId.has(record.id), `record not found`);
            this._regionRecordsByRecordId = new Map<string, RegionItemRecord>(this._regionRecordsByRecordId.set(record.id, record));
            this._setItemsArrayAndSelectedItem();
        },
        updateRecord(record: RegionItemRecord) {
            Guard.isDefined(record, `record must be defined`);
            this._deleteByRecordId(record.id);
            this.addRecord(record);
        },
        removeByRegionItemId(id: string): RegionItemRecord {
            Guard.isString(id, `id must be defined and be a string`);
            const regionItemRecord: RegionItemRecord = this.findByRecordRegionItemId(id);
            Guard.isDefined(regionItemRecord, `record not found`);
            return this.removeByRecordId(regionItemRecord.id);
        },
        removeByRecordId(id: string): RegionItemRecord {
            Guard.isString(id, `id must be defined and be a string`);
            Guard.isTruthy(this._regionRecordsByRecordId.has(id), `record not found`);
            const record = this._regionRecordsByRecordId.get(id);
            this._deleteByRecordId(record.id);
            this._setItemsArrayAndSelectedItem();
            return record;
        },
        reset() {
            this._regionRecordsByRecordId = new Map();
            this._setItemsArrayAndSelectedItem();
        },
        unload() {
            Guard.isFalsey(this._isUnloading, 'Already unloading');
            this._isUnloading = true;
            this._regionRecordsByRecordId.forEach((regionItemRecord: RegionItemRecord) => {
                regionItemRecord.model.dispose();
                regionItemRecord.dispose();
            });
            this.reset();
            this._isUnloading = false;
        },
        _setItemsArrayAndSelectedItem() {
            this._regionItems = Array.from<RegionItemRecord>(this._regionRecordsByRecordId.values())
                .filter(r => r.modelCreated)
                .map(r => (<RegionItemRecord>r).regionItem);
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
        findByRecordRegionItemId(regionItemId: string) {
            return Array
                .from<RegionItemRecord>(this._regionRecordsByRecordId.values())
                .find(r => r.modelCreated && r.regionItem.id === regionItemId);
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

    public getRegionState(): RegionState {
        return null;
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
        this._regionManager.registerRegion(regionName, this,);
        this.addDisposable(() => {
            this._regionManager.unregisterRegion(regionName);
        });
    }

    @observeEvent(EspUiEventNames.regions_selectedItemChanged)
    private _onRegionSelectedItemChanged(ev: SelectedItemChangedEvent) {
        this.setSelected(ev.regionItemRecord);
    }

    public setSelected(item: RegionItemRecord | RegionItem) {
        this._state.setSelected(item);
    }

    public addRegionItem(regionItem: RegionItem): void {
        if (!this.isOnDispatchLoop()) {
            this.ensureOnDispatchLoop(() => this.addRegionItem(regionItem));
            return;
        }
        _log.debug(`Adding to region ${this._regionName}. ${regionItem.toString()}`);
        Guard.isFalsey(this._state.has(regionItem), `Model ${regionItem.modelId} already in region`);
        // We get the initial model and store a reference to it.
        // In esp the top level model instance never changes.
        // This is true even for immutable models, they always have a parent that doesn't change, the store that hangs off that parent will change.
        let model = this._router.getModel(regionItem.modelId);
        const viewFactoryMetadata: ViewFactoryMetadata = getViewFactoryMetadataFromModelInstance(model);
        let regionItemRecord = new RegionItemRecord(regionItem, viewFactoryMetadata, model);
        this.addRegionRecord(regionItemRecord);
    }

    protected addRegionRecord(regionItemRecord: RegionItemRecord): RegionItemRecord {
        Guard.isTruthy(this._router.isOnDispatchLoopFor(this.modelId), `Protected methods should be called on correct dispatch loop`);
        if (!regionItemRecord.modelCreated) {
            const singleModuleLoader = regionItemRecord.viewFactoryEntry.container.resolve<SingleModuleLoader>(SystemContainerConst.single_module_loader);
            if (singleModuleLoader.hasLoaded) {
                const model = regionItemRecord.viewFactoryEntry.factory.createView(regionItemRecord.viewState);
                const regionItem = new RegionItem(model.modelId);
                regionItemRecord = regionItemRecord.update(regionItem, regionItemRecord.viewFactoryEntry.factory.metadata, model);
            } else {
                regionItemRecord.addDisposable(singleModuleLoader.loadResults
                    .filter(lr => lr.hasCompletedLoaded)
                    .take(1)
                    .subscribeWithRouter(
                        this.router,
                        this.modelId,
                        () => {
                            const model = regionItemRecord.viewFactoryEntry.factory.createView(regionItemRecord.viewState);
                            const regionItem = new RegionItem(model.modelId);
                            regionItemRecord = regionItemRecord.update(regionItem, regionItemRecord.viewFactoryEntry.factory.metadata, model);
                            this.updateRegionItemRecord(regionItemRecord);
                        },
                        (err: any) => {
                            _log.error(`Error waiting for module to load inorder to create view from factory ${regionItemRecord.viewState.viewFactoryKey}`, err);
                            // flag view as error
                        }
                    )
                );
            }
        }
        this._state.addRecord(regionItemRecord);
        return regionItemRecord;
    }

    protected updateRegionItemRecord(regionItemRecord: RegionItemRecord) {
        this._state.updateRecord(regionItemRecord);
    }

    public removeRegionItem(regionItem: RegionItem): void {
        if (!this.isOnDispatchLoop()) {
            this.ensureOnDispatchLoop(() => this.removeRegionItem(regionItem));
            return;
        }
        let regionItemRecord = this._state.findByRecordRegionItemId(regionItem.id);
        this.removeRegionItemRecord(regionItemRecord);
    }

    protected removeRegionItemRecord(regionItemRecord: RegionItemRecord): RegionItemRecord {
        Guard.isTruthy(this._router.isOnDispatchLoopFor(this.modelId), `Protected methods should be called on correct dispatch loop`);
        _log.debug(`Removing from region ${this._regionName}. ${regionItemRecord.toString()}`);
        return this._state.removeByRecordId(regionItemRecord.id);
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

    protected getViewState(regionItemRecord: RegionItemRecord): ViewState<any> {
        if (!regionItemRecord.modelCreated) {
            return null;
        }

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

    load(regionState: RegionState)  {
        this.ensureOnDispatchLoop(() => {
            if (regionState) {
                regionState.viewState.forEach((viewState: ViewState<any>) => {
                    this.loadView(viewState);
                });
            }
        });
    }

    protected loadView(viewState: ViewState<any>): RegionItemRecord {
        Guard.isTruthy(this._router.isOnDispatchLoopFor(this.modelId), `Protected methods should be called on correct dispatch loop`);
        // At this point the view factories should have been loaded, however each module may not have finished loading.
        // ViewFactories assume the module is loaded, it would be complicated to push this concern to them, really that's a higher level concern.
        // The only mid ground is the regions whereby they can try load views for modules that are ready and show some spinning UI for views belonging to modules that are not ready.
        // We have to do that here and model it via RegionItem.
        if (this._viewRegistry.hasViewFactory(viewState.viewFactoryKey)) {
            const viewFactoryEntry: ViewFactoryEntry = this._viewRegistry.getViewFactoryEntry(viewState.viewFactoryKey);
            const regionItemRecord = new RegionItemRecord(viewFactoryEntry, viewState);
            this.addRegionRecord(regionItemRecord);
            return regionItemRecord;
        } else {
            // It's possible the component factory isn't loaded, perhaps old state had a component which the users currently isn't entitled to see ATM.
            _log.warn(`Skipping load for view as it's factory of type [${viewState.viewFactoryKey}] is not registered`);
            return null;
        }
    }

    public unload() {
        this._state.unload();
    }
}