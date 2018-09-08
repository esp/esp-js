import {RegionItem} from '../../regionItem';
import {RegionModelBase} from '../../regionModelBase';
import {DisplayOptions} from '../../regionManager';

export class SingleItemRegionModel extends RegionModelBase {
    public item:RegionItem;
    
    constructor(regionName : string, router, regionManager) {
        super(regionName, router, regionManager);
        this.item = null;
    }

    protected _addToRegion(regionItem:RegionItem, displayOptions?: DisplayOptions) {
        this.item = regionItem;
    }

    protected _removeFromRegion(regionItem:RegionItem, displayOptions?: DisplayOptions) {
        this.item = null;
    }

    public reset() {
        this.item = null;
    }
}
