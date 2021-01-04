import * as uuid from 'uuid';
import {DisplayOptions} from './regionManager';
import {Guard} from 'esp-js';

/**
 * A cut down version of a RegionItemRecord, this allows external callers to add an item to a region and control it's ID
 */
export class RegionItem {
    private _modelId: string;
    private _regionRecordId: string;
    private _displayOptions: DisplayOptions;
    private _regionRecordExists: boolean = false;

    public static create(modelId: string, displayOptions?: DisplayOptions) {
        Guard.isString(modelId, `modelId must be a string`);
        return new RegionItem(modelId, displayOptions);
    }

    public static createExisting(regionRecordId: string, modelId: string, displayOptions?: DisplayOptions) {
        Guard.isString(modelId, `regionRecordId must be a string`);
        Guard.isString(modelId, `modelId must be a string`);
        const item = new RegionItem(modelId, displayOptions);
        item._regionRecordId = regionRecordId;
        item._regionRecordExists = true;
        return item;
    }

    /**
     * @deprecated user the static creation factories `RegionItem.create()` and `RegionItem.createExisting()`
     */
    constructor(modelId: string, displayOptions?: DisplayOptions) {
        Guard.isString(modelId, `modelId must be a string`);
        if (displayOptions) {
            Guard.isObject(displayOptions, `displayOptions must be a object`);
        }
        this._modelId =  modelId;
        this._regionRecordId = uuid.v4();
        this._displayOptions =  displayOptions;
        this._regionRecordExists = false;
    }

    public get regionRecordId(): string {
        return this._regionRecordId;
    }

    public get modelId(): string {
        return this._modelId;
    }

    public get displayOptions(): DisplayOptions {
        return this._displayOptions;
    }

    /**
     * True if this RegionItem was created with an existing regionRecordId, typically the case when the item in question was loaded from state by a region already
     */
    public get regionRecordExists(): boolean {
        return this._regionRecordExists;
    }

    public toString() {
        if (this._displayOptions) {
            return `RegionItem: Id:${this._regionRecordId}, ModelId:${this._modelId}. Display options: context:${this._displayOptions.displayContext}, title:${this._displayOptions.title}`;
        } else {
            return `RegionItem: Id:${this._regionRecordId}, ModelId:${this._modelId}. Display options: 'n/a'}`;
        }
    }
}
