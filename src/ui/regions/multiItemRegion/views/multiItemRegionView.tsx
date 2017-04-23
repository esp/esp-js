import {SmartComponent} from 'esp-js-react';
import * as _ from 'lodash';
import * as React from 'react';
import * as classnames from 'classnames';
import { Logger } from '../../../../core';
import ItemItemView from './itemItemView';
import MultiItemRegionModel from '../model/multiItemRegionModel';
import ViewBase from '../../../viewBase';
import RegionItem from '../../regionItem';
import {ViewBaseProps} from '../../../viewBase';

const _log = Logger.create('MultiItemRegionView');

export interface MultiItemRegionViewProps extends ViewBaseProps<MultiItemRegionModel> {
    className?: string;
}

export default class MultiItemRegionView extends ViewBase<MultiItemRegionView, MultiItemRegionModel, MultiItemRegionViewProps> {
  
    render() {
        _log.verbose('Rendering');
        
        let model : MultiItemRegionModel = this.props.model;
        
        if(!model) {
            return null;
        }
        if(model.items.length === 0) {
            // if there are no items we don't want to spit out any html which may affect layout
            return null;
        }
        
        let items = _.map<RegionItem, any>(model.items, (regionItem:RegionItem) => {
            _log.verbose(`Adding view for model [${regionItem.modelId}] with key [${regionItem.itemKey}]`);
            return (<ItemItemView key={regionItem.itemKey}>
                <SmartComponent modelId={regionItem.modelId} viewContext={regionItem.displayContext} />
            </ItemItemView>);
        });

        let className = classnames(this.props.className, 'multi-item-container');
        
        return (
            <div className={className}>
                {items}
            </div>
        );
    }
}
