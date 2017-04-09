import RegionItem from '../../regionItem';
import RegionModelBase from '../../regionModelBase';

export default class SingleItemRegionsModel extends RegionModelBase {
    public item:RegionItem;
    
    constructor(regionName : string, router, regionManager) {
        super(regionName, router, regionManager);
        this.item = null;
    }

    _addToRegion(title: string, modelId:string, displayContext?:string) {
        this.item = new RegionItem(title, modelId, displayContext);
    }

    _removeFromRegion(modelId:string, displayContext?:string) {
        this.item = null;
    }
}
