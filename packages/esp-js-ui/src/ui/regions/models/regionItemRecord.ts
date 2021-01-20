import {RegionRecordState, ViewFactoryEntry, ViewFactoryMetadata} from '../../viewFactory';
import {DisposableBase, Guard} from 'esp-js';
import {DisplayOptions} from './regionManager';

/**
 * Contains all data a regions holds about a given view it contains.
 */
export class RegionItemRecord extends DisposableBase {
    private readonly _id: string;
    private readonly _viewFactoryMetadata: ViewFactoryMetadata;
    private readonly _model: any;
    private readonly _modelId: string;
    private readonly _viewFactoryEntry: ViewFactoryEntry;
    private readonly _displayOptions: DisplayOptions;
    private readonly _initialRecordState: RegionRecordState;

    public static createForStateLoadedItem(id: string, viewFactoryEntry: ViewFactoryEntry, recordState: RegionRecordState) {
        Guard.isString(id, `id required`);
        Guard.isDefined(viewFactoryEntry, `viewFactoryMetadata required`);
        Guard.isDefined(recordState, `recordState required`);
        return new RegionItemRecord(id, viewFactoryEntry, viewFactoryEntry.factory.metadata, null, null, recordState);
    }

    public static createForExistingItem(id: string, viewFactoryEntry: ViewFactoryEntry, model: any, displayOptions?: DisplayOptions) {
        Guard.isString(id, `id required`);
        Guard.isDefined(viewFactoryEntry, `viewFactoryEntry required`);
        Guard.isDefined(model, `model required`);
        Guard.isString(model.modelId, `model.modelId required`);
        if (displayOptions) {
            Guard.isObject(displayOptions, `displayOptions should be an object`);
        }
        return new RegionItemRecord(id, viewFactoryEntry, viewFactoryEntry.factory.metadata, model, displayOptions, null);
    }

    private constructor(
        id: string,
        viewFactoryEntry: ViewFactoryEntry,
        viewFactoryMetadata: ViewFactoryMetadata,
        model: any,
        displayOptions: DisplayOptions,
        recordState: RegionRecordState
    ) {
        super();
        this._id = id;
        this._viewFactoryEntry = viewFactoryEntry;
        this._viewFactoryMetadata = viewFactoryMetadata;
        this._model = model;
        this._modelId = model ? model.modelId : null;
        this._displayOptions = displayOptions;
        this._initialRecordState = recordState;
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
        return this._displayOptions ? this._displayOptions.displayContext : null;
    }

    public get title(): string {
        return this._displayOptions ? this._displayOptions.title : null;
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

    public update(model: any): RegionItemRecord {
        Guard.isDefined(model, `model required`);
        return new RegionItemRecord(this._id, this._viewFactoryEntry, this._viewFactoryMetadata, model, this._displayOptions, this._initialRecordState);
    }

    public toString() {
        return `id:${this.id},modelId:${this.modelId || 'N/A'}`;
    }
}
