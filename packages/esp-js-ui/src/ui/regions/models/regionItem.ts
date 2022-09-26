import * as uuid from 'uuid';
import {RegionItemOptions} from './regionManager';
import {Guard} from 'esp-js';

/**
 * A cut down version of a RegionItemRecord, this allows external callers to add an item to a region and control it's ID
 */
export class RegionItem {
    private _modelId: string;
    private _regionRecordId: string;
    private _regionItemOptions: RegionItemOptions;
    private _regionRecordExists: boolean = false;

    public static create(modelId: string, regionItemOptions?: RegionItemOptions) {
        Guard.isString(modelId, `modelId must be a string`);
        return new RegionItem(modelId, regionItemOptions);
    }

    public static createExisting(regionRecordId: string, modelId: string, regionItemOptions?: RegionItemOptions) {
        Guard.isString(modelId, `regionRecordId must be a string`);
        Guard.isString(modelId, `modelId must be a string`);
        const item = new RegionItem(modelId, regionItemOptions);
        item._regionRecordId = regionRecordId;
        item._regionRecordExists = true;
        return item;
    }

    /**
     * @deprecated user the static creation factories `RegionItem.create()` and `RegionItem.createExisting()`
     */
    constructor(modelId: string, regionItemOptions?: RegionItemOptions) {
        Guard.isString(modelId, `modelId must be a string`);
        if (regionItemOptions) {
            Guard.isObject(regionItemOptions, `regionItemOptions must be a object`);
        }
        this._modelId =  modelId;
        this._regionRecordId = uuid.v4();
        this._regionItemOptions =  regionItemOptions;
        this._regionRecordExists = false;
    }

    public get regionRecordId(): string {
        return this._regionRecordId;
    }

    public get modelId(): string {
        return this._modelId;
    }

    /**
     * @deprecated use regionItemOptions
     */
    public get displayOptions(): RegionItemOptions {
        return this.regionItemOptions;
    }

    public get regionItemOptions(): RegionItemOptions {
        return this._regionItemOptions;
    }

    public get title(): string {
        return this._regionItemOptions ? this._regionItemOptions.title : '';
    }

    /**
     * True if this RegionItem was created with an existing regionRecordId, typically the case when the item in question was loaded from state by a region already
     */
    public get regionRecordExists(): boolean {
        return this._regionRecordExists;
    }

    public updateOptions(regionItemOptions: Partial<RegionItemOptions>) {
        Guard.isDefined(regionItemOptions, `regionItemOptions required`);
        this._regionItemOptions = {
            ...this._regionItemOptions,
            ...regionItemOptions
        };
    }

    public toString() {
        if (this._regionItemOptions) {
            return `RegionItem: Id:${this._regionRecordId}, ModelId:${this._modelId}. Display options: context:${this._regionItemOptions.displayContext}, title:${this._regionItemOptions.title}, tag:${this._regionItemOptions.tag}`;
        } else {
            return `RegionItem: Id:${this._regionRecordId}, ModelId:${this._modelId}. Display options: 'n/a'}`;
        }
    }
}
