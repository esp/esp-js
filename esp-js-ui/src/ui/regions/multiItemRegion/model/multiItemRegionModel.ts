import { Router, observeEvent } from 'esp-js';
import RegionItem from '../../regionItem';
import RegionModelBase from '../../regionModelBase';
import RegionManager from '../../regionManager';
import MultiItemRegionEventConst from './multiItemRegionEventConst';

export interface SelectedItemChangedEvent {
    selectedItem: RegionItem;
}

export default class MultiItemRegionModel extends RegionModelBase {
    public items : Array<RegionItem> = [];
    public selectedItem: RegionItem;

    constructor(regionName: string, router: Router, regionManager: RegionManager) {
        super(regionName, router, regionManager);
    }
    
    @observeEvent(MultiItemRegionEventConst.selectedItemChanged)
    private _observeSelectedItemChanged(ev: SelectedItemChangedEvent) {
        this.selectedItem = ev.selectedItem;
    }

    protected _addToRegion(title: string, modelId:string, displayContext?:string) : void {
        this.items.push(new RegionItem(title, modelId, displayContext));
    }

    protected _removeFromRegion(modelId:string, displayContext?:string) : void {
        for(let i = this.items.length; i--;) {
            let item = this.items[i];
            if(item === this.selectedItem) {
                this.selectedItem = null;   
            }
            
            if(item.equals(modelId, displayContext)) {
                this.items.splice(i, 1);
                break;
            }
        }
        if(!this.selectedItem && this.items.length > 0) {
            this.selectedItem = this.items[0];
        }
    }
}
