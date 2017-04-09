import {SmartComponent} from 'esp-js-react';
import * as _ from 'lodash';
import * as React from 'react';
import * as classnames from 'classnames';
import { Logger } from '../../../../core';
import TileItemView from './tileItemView';
import IMultiTileRegionViewProps from './IMultiTileRegionViewProps';
import MultiTileRegionModel from '../model/multiTileRegionModel';
import ViewBase from '../../../viewBase';
import RegionItem from '../../regionItem';
import {IViewBaseProps} from '../../../viewBase';

const _log = Logger.create('MultiTileRegionView');

export default class MultiTileRegionView extends ViewBase<MultiTileRegionView, MultiTileRegionModel, IMultiTileRegionViewProps> {
  
    render() {
        _log.verbose('Rendering');
        
        let model : MultiTileRegionModel = this.props.model;
        
        if(!model) {
            return null;
        }
        if(model.tileItems.length === 0) {
            // if there are no items we don't want to spit out any html which may affect layout
            return null;
        }
        
        let items = _.map<RegionItem, any>(model.tileItems, (regionItem:RegionItem) => {
            _log.verbose(`Adding view for model [${regionItem.modelId}] with key [${regionItem.itemKey}]`);
            return (<TileItemView key={regionItem.itemKey}>
                <SmartComponent modelId={regionItem.modelId} viewContext={regionItem.displayContext} />
            </TileItemView>);
        });

        let className = classnames(this.props.className, 'multi-tile-container');
        
        return (
            <div className={className}>
                {items}
            </div>
        );
    }
}
