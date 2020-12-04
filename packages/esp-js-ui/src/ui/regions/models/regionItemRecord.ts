import {RegionItem} from './regionItem';
import {ViewFactoryMetadata} from '../../viewFactory';

export interface RegionItemRecord {
    regionItem: RegionItem;
    viewFactoryMetadata: ViewFactoryMetadata;
    model: any;
}
