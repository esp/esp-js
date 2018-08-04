export class RegionItem {
    constructor(public title: string, public modelId:string, public displayContext?:string) {
    }

    public get itemKey() {
        if(typeof this.displayContext === 'undefined') {
            return this.modelId;
        } else {
            return `${this.modelId}${this.displayContext}`;
        }
    }

    public equals(modelId:string, displayContext?:string) {
        return this.modelId === modelId && this.displayContext === displayContext;
    }
}
