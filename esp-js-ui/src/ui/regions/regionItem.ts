export default class RegionItem {
    public title:string;
    public modelId:string;
    public displayContext:string;
    constructor(title: string, modelId:string, displayContext?:string) {
        this.title = title;
        this.modelId = modelId;
        this.displayContext = displayContext;
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
