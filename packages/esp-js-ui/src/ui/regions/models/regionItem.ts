import * as uuid from 'uuid';
import {DisplayOptions} from './regionManager';

export class RegionItem {
    public readonly id: string;
    constructor(public modelId: string, public displayOptions?: DisplayOptions) {
        this.id = uuid.v4();
    }
    public toString() {
        if (this.displayOptions) {
            return `RegionItem: Id:${this.id}, ModelId:${this.modelId}. Display options: context:${this.displayOptions.displayContext}, title:${this.displayOptions.title}`;
        } else {
            return `RegionItem: Id:${this.id}, ModelId:${this.modelId}. Display options: 'n/a'}`;
        }
    }
    public equals(other: RegionItem) {
        return this.id === other.id;
    }

    public get displayContext(): string {
        return this.displayOptions ? this.displayOptions.displayContext : null;
    }

    public get title(): string {
        return this.displayOptions ? this.displayOptions.title : null;
    }
}
