import {RegionItem, RegionItemOptions} from './regions';

export namespace EspUiEvents {
    export interface AddToRegionEvent {
        regionName: string;
        regionItem: RegionItem;
    }

    export interface UpdateRegionItemEvent {
        /**
         * Can be model id, or regionRecordId
         */
        id: string;
        options: RegionItemOptions;
    }

    export interface RemoveFromRegionEvent {
        regionName: string;
        regionItem: RegionItem;
    }
}