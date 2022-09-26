import {RegionItem} from './regionItem';
import {RegionItemRecord} from './regionItemRecord';

export const isRegionItem = (value: any): value is RegionItem => {
    if (!value) {
        return false;
    }

    const ri = value as RegionItem;
    return !!ri.updateOptions;
};

export const isRegionItemRecord = (value: any): value is RegionItemRecord => {
    if (!value) {
        return false;
    }

    const ri = value as RegionItemRecord;
    return !!ri.updateWithModel;
};