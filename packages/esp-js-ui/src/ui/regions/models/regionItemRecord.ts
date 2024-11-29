import {RegionRecordState, ViewFactoryEntry, ViewFactoryMetadata} from '../../viewFactory';
import {DisposableBase, Guard} from 'esp-js';
import {RegionItemOptions} from './regionManager';

/**
 * Contains all data a regions holds about a given view it contains.
 */
export class RegionItemRecord extends DisposableBase {
    private readonly _id: string;
    private readonly _viewFactoryMetadata: ViewFactoryMetadata;
    private readonly _model: any;
    private readonly _modelId: string;
    private readonly _viewFactoryEntry: ViewFactoryEntry;
    private readonly _regionItemOptions: RegionItemOptions;
    private readonly _initialRecordState: RegionRecordState;
    private readonly _error: any;

    public static createForStateLoadedItem(id: string, viewFactoryEntry: ViewFactoryEntry, recordState: RegionRecordState) {
        Guard.isString(id, `id required`);
        Guard.isDefined(viewFactoryEntry, `viewFactoryMetadata required`);
        Guard.isDefined(recordState, `recordState required`);
        return new RegionItemRecord(id, viewFactoryEntry, viewFactoryEntry.factory.metadata, null, null, recordState, null);
    }

    public static createForExistingItem(id: string, viewFactoryEntry: ViewFactoryEntry, model: any, regionItemOptions?: RegionItemOptions) {
        Guard.isString(id, `id required`);
        Guard.isDefined(viewFactoryEntry, `viewFactoryEntry required`);
        Guard.isDefined(model, `model required`);
        Guard.isString(model.modelId, `model.modelId required`);
        if (regionItemOptions) {
            Guard.isObject(regionItemOptions, `regionItemOptions should be an object`);
        }
        return new RegionItemRecord(id, viewFactoryEntry, viewFactoryEntry.factory.metadata, model, regionItemOptions, null, null);
    }

    private constructor(
        id: string,
        viewFactoryEntry: ViewFactoryEntry,
        viewFactoryMetadata: ViewFactoryMetadata,
        model: any,
        regionItemOptions: RegionItemOptions,
        recordState: RegionRecordState,
        error: any
    ) {
        super();
        this._id = id;
        this._viewFactoryEntry = viewFactoryEntry;
        this._viewFactoryMetadata = viewFactoryMetadata;
        this._model = model;
        this._modelId = model ? model.modelId : null;
        this._regionItemOptions = regionItemOptions;
        this._initialRecordState = recordState;
        this._error = error;
    }

    public get id(): string {
        return this._id;
    }

    public get viewFactoryEntry(): ViewFactoryEntry {
        return this._viewFactoryEntry;
    }

    public get viewFactoryMetadata(): ViewFactoryMetadata {
        return this._viewFactoryMetadata;
    }

    public get model(): any {
        return this._model;
    }

    public get modelId(): string {
        return this.modelCreated ? this._modelId : null;
    }

    public get displayContext(): string {
        return this._regionItemOptions ? this._regionItemOptions.displayContext : null;
    }

    public get title(): string {
        return this._regionItemOptions ? this._regionItemOptions.title : null;
    }

    public get tag(): string {
        return this._regionItemOptions ? this._regionItemOptions.tag : null;
    }

    public get modelCreated(): boolean {
        return !!this._model && !!this._viewFactoryMetadata;
    }

    public get initialRecordState(): RegionRecordState {
        return this._initialRecordState;
    }

    public get wasCreatedFromState(): boolean {
        return !!this._initialRecordState;
    }

    public get error(): any {
        return this._error;
    }

    public get hasError(): boolean {
        return !!this._error;
    }

    public updateWithModel(model: any): RegionItemRecord {
        Guard.isDefined(model, `model required`);
        return new RegionItemRecord(this._id, this._viewFactoryEntry, this._viewFactoryMetadata, model, this._regionItemOptions, this._initialRecordState, this._error);
    }

    public updateWithOptions(regionItemOptions: Partial<RegionItemOptions>): RegionItemRecord {
        Guard.isDefined(regionItemOptions, `regionItemOptions required`);
        const newOptions = {
            ...this._regionItemOptions,
            ...regionItemOptions
        };
        return new RegionItemRecord(this._id, this._viewFactoryEntry, this._viewFactoryMetadata, this._model, newOptions, this._initialRecordState, this._error);
    }

    public updateWithError(error: any): RegionItemRecord {
        return new RegionItemRecord(this._id, this._viewFactoryEntry, this._viewFactoryMetadata, this._model, this._regionItemOptions, this._initialRecordState, error);
    }

    public toString() {
        return `id:${this.id},modelId:${this.modelId || 'N/A'}`;
    }
}
