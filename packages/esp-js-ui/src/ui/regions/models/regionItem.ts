import * as uuid from 'uuid';
import {DisplayOptions} from './regionManager';

/**
 * A cut down version of a RegionItemRecord, this allows external callers to add an item to a region and control it's ID
 */
export class RegionItem {
    public readonly regionRecordId: string;
        constructor(public modelId: string, public displayOptions?: DisplayOptions) {
        this.regionRecordId = uuid.v4();
    }
    public toString() {
        if (this.displayOptions) {
            return `RegionItem: Id:${this.regionRecordId}, ModelId:${this.modelId}. Display options: context:${this.displayOptions.displayContext}, title:${this.displayOptions.title}`;
        } else {
            return `RegionItem: Id:${this.regionRecordId}, ModelId:${this.modelId}. Display options: 'n/a'}`;
        }
    }

    public get displayContext(): string {
        return this.displayOptions ? this.displayOptions.displayContext : null;
    }

    public get title(): string {
        return this.displayOptions ? this.displayOptions.title : null;
    }
}
