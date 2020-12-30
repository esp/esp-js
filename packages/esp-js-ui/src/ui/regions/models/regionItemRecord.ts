import {RegionItem} from './regionItem';
import {ViewFactoryEntry, ViewFactoryMetadata} from '../../viewFactory';
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
    private readonly _displayOptions?: DisplayOptions;

    constructor(
        id: string,
        viewFactoryEntry: ViewFactoryEntry,
    );
    constructor(
        regionItem: RegionItem,
        viewFactoryMetadata: ViewFactoryMetadata,
        model: any,
    );
    constructor(
        id: string,
        viewFactoryMetadata: ViewFactoryMetadata,
        model: any,
        displayOptions: DisplayOptions,
    );
    constructor(...args: any[]) {
        super();
        if (args.length === 2) {
            Guard.isString(args[0], `id required`);
            Guard.isDefined(args[1], `viewFactoryEntry required`);
            this._id = args[0];
            this._viewFactoryEntry = args[1];
        } else if (args.length === 3) {
            Guard.isDefined(args[0], `regionItem required`);
            Guard.isDefined(args[1], `viewFactoryMetadata required`);
            Guard.isDefined(args[2], `model required`);
            Guard.isString(args[2].modelId, `model.modelId required`);
            let regionItem = <RegionItem>args[0];
            this._id = regionItem.regionRecordId;
            this._modelId = regionItem.modelId;
            this._displayOptions = regionItem.displayOptions;
            this._viewFactoryMetadata = args[1];
            this._model = args[2];
        } else {
            Guard.isString(args[0], `id required`);
            Guard.isDefined(args[1], `viewFactoryMetadata required`);
            Guard.isDefined(args[2], `model required`);
            Guard.isString(args[2].modelId, `model.modelId required`);
            this._id = args[0];
            this._viewFactoryMetadata = args[1];
            this._model = args[2];
            this._modelId = this._model.modelId;
            this._displayOptions = args.length === 4 ? args[3] : null;
        }
    }

    public get id(): string {
        return this._id;
    }

    public get viewFactoryMetadata(): ViewFactoryMetadata {
        return this._viewFactoryMetadata;
    }

    public get viewFactoryEntry(): ViewFactoryEntry {
        return this._viewFactoryEntry;
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

    public update(viewFactoryMetadata: ViewFactoryMetadata, model: any): RegionItemRecord {
        Guard.isDefined(viewFactoryMetadata, `viewFactoryMetadata required`);
        Guard.isDefined(model, `model required`);
        return new RegionItemRecord(this.id, viewFactoryMetadata, model, this._displayOptions);
    }

    public toString() {
        return `id:${this.id},modelId:${this.modelId || 'N/A'}`;
    }
}
