import {Router, observeEvent} from 'esp-js';
import {RegionItem} from '../../regionItem';
import {RegionModelBase} from '../../regionModelBase';
import {RegionManager} from '../../regionManager';
import {EspUiEventNames} from '../../../espUiEventNames';

export interface SelectedItemChangedEvent {
    selectedItem: RegionItem;
}

export class MultiItemRegionModel extends RegionModelBase {
    public items: Array<RegionItem> = [];
    public selectedItem: RegionItem;

    constructor(regionName: string, router: Router, regionManager: RegionManager) {
        super(regionName, router, regionManager);
    }

    @observeEvent(EspUiEventNames.regions_multiItemRegion_selectedItemChanged)
    private _observeSelectedItemChanged(ev: SelectedItemChangedEvent) {
        this.selectedItem = ev.selectedItem;
    }

    protected _addToRegion(regionItem: RegionItem): void {
        this.items.push(regionItem);
    }

    public reset() {
        this.items.length = 0;
    }

    protected _removeFromRegion(regionItem: RegionItem): void {
        for (let i = this.items.length; i--;) {
            let item = this.items[i];
            if (item.equals(regionItem)) {
                this.items.splice(i, 1);
                if (item === this.selectedItem) {
                    this.selectedItem = null;
                }
                break;
            }
        }
        if (!this.selectedItem && this.items.length > 0) {
            this.selectedItem = this.items[0];
        }
    }
}
