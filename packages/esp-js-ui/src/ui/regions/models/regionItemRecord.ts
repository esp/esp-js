import {RegionItem} from './regionItem';
import {ViewFactoryEntry, ViewFactoryMetadata} from '../../viewFactory';
import {DisposableBase, Guard} from 'esp-js';
import * as uuid from 'uuid';

export class RegionItemRecord extends DisposableBase {
    private _id: string;
    private readonly _regionItem: RegionItem;
    private readonly _viewFactoryMetadata: ViewFactoryMetadata;
    private readonly _model: any;
    private readonly _viewFactoryEntry: ViewFactoryEntry;

    constructor(
        viewFactoryEntry: ViewFactoryEntry,
    );
    constructor(
        regionItem: RegionItem,
        viewFactoryMetadata: ViewFactoryMetadata,
        model: any,
    );
    constructor(...args: any[]) {
        super();
        this._id = uuid.v4();
        if (args.length === 1) {
            Guard.isDefined(args[0], `viewFactoryEntry required`);
            this._viewFactoryEntry = args[0];
        } else {
            this._regionItem = args[0];
            this._viewFactoryMetadata = args[1];
            this._model = args[2];
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
        return this.modelCreated ? this._regionItem.modelId : null;
    }

    public get title(): string {
        return this.modelCreated ? this._regionItem.title : null;
    }

    public get displayContext(): string {
        return this.modelCreated ? this._regionItem.displayContext : null;
    }

    public get modelCreated(): boolean {
        return !!this._regionItem && !!this._model && !!this._viewFactoryMetadata;
    }

    public get regionItem(): RegionItem {
        return this._regionItem;
    }

    public update(regionItem: RegionItem, viewFactoryMetadata: ViewFactoryMetadata, model: any): RegionItemRecord {
        Guard.isDefined(regionItem, `regionItem required`);
        Guard.isDefined(regionItem, `viewFactoryMetadata required`);
        Guard.isDefined(regionItem, `model required`);
        let regionItemRecord = new RegionItemRecord(regionItem, viewFactoryMetadata, model);
        regionItemRecord._id = this._id;
        return regionItemRecord;
    }

    public toString() {
        return `id:${this.id},modelId:${this._regionItem ? this._regionItem.modelId : 'NA'}`;
    }
}
