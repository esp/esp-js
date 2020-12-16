import {RegionItem} from './regionItem';
import {ViewFactoryEntry, ViewFactoryMetadata, ViewState} from '../../viewFactory';
import {DisposableBase, Guard} from 'esp-js';
import * as uuid from 'uuid';

export class RegionItemRecord extends DisposableBase {
    private _id: string;
    private readonly _regionItem: RegionItem;
    private readonly _viewFactoryMetadata: ViewFactoryMetadata;
    private readonly _model: any;
    private readonly _viewFactoryEntry: ViewFactoryEntry;
    private readonly _viewState: ViewState<object>;

    constructor(
        viewFactoryEntry: ViewFactoryEntry,
        viewState: ViewState<object>,
    );
    constructor(
        regionItem: RegionItem,
        viewFactoryMetadata: ViewFactoryMetadata,
        model: any,
    );
    constructor(...args: any[]) {
        super();
        this._id = uuid.v4();
        if (args.length === 2) {
            Guard.isDefined(args[0], `viewFactoryEntry required`);
            Guard.isDefined(args[1], `viewState required`);
            this._viewFactoryEntry = args[0];
            this._viewState = args[1];
        } else {
            this._regionItem = args[0];
            this._viewFactoryMetadata = args[1];
            this._model = args[2];
        }
    }

    public get id(): string {
        return this._id;
    }

    public get regionItem(): RegionItem {
        return this._regionItem;
    }

    public get viewFactoryMetadata(): ViewFactoryMetadata {
        return this._viewFactoryMetadata;
    }

    public get viewFactoryEntry(): ViewFactoryEntry {
        return this._viewFactoryEntry;
    }

    public get viewState(): ViewState<object> {
        return this._viewState;
    }

    public get model(): any {
        return this._model;
    }

    public get modelCreated(): boolean {
        return !!this._regionItem && !!this._model && !!this._viewFactoryMetadata;
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
