import { Router, observeEvent } from 'esp-js';
import RegionItem from '../../regionItem';
import RegionModelBase from '../../regionModelBase';
import RegionManager from '../../regionManager';
import MultiTileRegionEventConst from './events/multiTileRegionEventConst';
import SelectedTileChangedEvent from './events/selectedTileChangedEvent';

export default class MultiTileRegionModel extends RegionModelBase {
    public tileItems : Array<RegionItem>;
    public selectedItem: RegionItem;

    constructor(regionName : string, router: Router, regionManager: RegionManager) {
        super(regionName, router, regionManager);
        this.tileItems = [];
    }
    
    @observeEvent(MultiTileRegionEventConst.selectedTileChanged)
    _observeSelectedTileChanged(ev: SelectedTileChangedEvent) {
        this.selectedItem = ev.selectedItem;
    }
    
    _addToRegion(title: string, modelId:string, displayContext?:string) : void {
        this.tileItems.push(new RegionItem(title, modelId, displayContext));
    }
    _removeFromRegion(modelId:string, displayContext?:string) : void {
        for(let i = this.tileItems.length; i--;) {
            let item = this.tileItems[i];
            if(item === this.selectedItem) {
                this.selectedItem = null;   
            }
            
            if(item.equals(modelId, displayContext)) {
                this.tileItems.splice(i, 1);
                break;
            }
        }
        if(!this.selectedItem && this.tileItems.length > 0) {
            this.selectedItem = this.tileItems[0];
        }
    }
}
