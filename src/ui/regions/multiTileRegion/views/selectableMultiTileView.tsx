import * as React from 'react';
import {SmartComponent} from 'esp-js-react';
import * as classnames from 'classnames';
import {Logger} from '../../../../core';
import ViewBase from '../../../viewBase';
import TileItemView from './tileItemView';
import MultiTileRegionModel from '../model/multiTileRegionModel';
import RegionItem from '../../regionItem';
import { MultiTileRegionEventConst } from '../model/events';
import SelectedTileChangedEvent from '../model/events/selectedTileChangedEvent';
import SelectableMultiTileViewProps from './selectableMultiTileViewProps';

const _log = Logger.create('MultiTileRegionView');

export default class SelectableMultiTileView extends ViewBase<SelectableMultiTileView, MultiTileRegionModel, SelectableMultiTileViewProps> {
  
    private _onItemClicked(item: RegionItem) : void {
        let ev : SelectedTileChangedEvent = { selectedItem: item };
        this.props.router.publishEvent(this.props.model.modelId, MultiTileRegionEventConst.selectedTileChanged, ev);
    }

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
        
        let selectedItem : RegionItem = model.selectedItem;
        if(!selectedItem) {
            selectedItem = model.tileItems[0];
        }

        let header = null;
        if(model.tileItems.length > 1) {
            let headerButtons = model.tileItems.map((tileItem: RegionItem) => {
                let className = classnames({
                    'item-header': true,
                    'is-selected': tileItem === model.selectedItem
                });

                return (<div
                    onClick={() => this._onItemClicked(tileItem)}
                    key={tileItem.itemKey}
                    className={className}>{tileItem.title}
                </div>);
            });
            header = (<div className='item-header-container'>{headerButtons}</div>);
        }

        let grids = model.tileItems.map((tileItem: RegionItem) => {
            if(tileItem === selectedItem) {
                return (<TileItemView key={tileItem.itemKey} className='single-tile-view-container'>
                    <SmartComponent modelId={tileItem.modelId} viewContext={tileItem.displayContext} />
                </TileItemView>);
            } else {
                return null;
            }
        });

        let classNames = classnames(this.props.className, 'selectable-multi-tile-container');

        return (
            <div className={classNames}>
                {header}
                {grids}
            </div>
        );
    }
}
