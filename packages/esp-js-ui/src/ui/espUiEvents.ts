import {RegionItem} from './regions';

export namespace EspUiEvents {
    export interface AddToRegionEvent {
        regionName: string;
        regionItem: RegionItem;
    }

    export interface RemoveFromRegionEvent {
        regionName: string;
        regionItem: RegionItem;
    }
}