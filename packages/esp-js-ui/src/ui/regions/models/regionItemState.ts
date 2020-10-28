import {RegionItem} from './regionItem';
import {ViewFactoryMetadata} from '../../viewFactory';

export interface RegionItemState {
    regionItem: RegionItem;
    viewFactoryMetadata: ViewFactoryMetadata;
    model: any;
}
