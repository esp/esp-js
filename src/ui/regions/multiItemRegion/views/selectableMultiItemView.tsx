
import * as React from 'react';
import {ConnectableComponent} from 'esp-js-react';
import * as classnames from 'classnames';
import {Logger} from '../../../../core';
import ViewBase from '../../../viewBase';
import ItemView from './itemView';
import MultiItemRegionModel from '../model/multiItemRegionModel';
import RegionItem from '../../regionItem';
import {ViewBaseProps} from '../../../viewBase';
import {SelectedItemChangedEvent} from '../model/multiItemRegionModel';
import MultiItemRegionEventConst from '../model/multiItemRegionEventConst';

const _log = Logger.create('MultiItemRegionView');

export interface SelectableMultiItemViewProps extends ViewBaseProps<MultiItemRegionModel> {
    className?: string;
}

export default class SelectableMultiItemView extends ViewBase<SelectableMultiItemView, MultiItemRegionModel, SelectableMultiItemViewProps> {
  
    private _onItemClicked(item: RegionItem) : void {
        let ev : SelectedItemChangedEvent = { selectedItem: item };
        this.props.router.publishEvent(this.props.model.modelId, MultiItemRegionEventConst.selectedItemChanged, ev);
    }

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
        
        let selectedItem : RegionItem = model.selectedItem;
        if(!selectedItem) {
            selectedItem = model.items[0];
        }

        let header = null;
        if(model.items.length > 1) {
            let headerButtons = model.items.map((item: RegionItem) => {
                let className = classnames({
                    'item-header': true,
                    'is-selected': item === model.selectedItem
                });

                return (<div
                    onClick={() => this._onItemClicked(item)}
                    key={item.itemKey}
                    className={className}>{item.title}
                </div>);
            });
            header = (<div className='item-header-container'>{headerButtons}</div>);
        }

        let grids = model.items.map((item: RegionItem) => {
            if(item === selectedItem) {
                return (<ItemView key={item.itemKey} className='single-item-view-container'>
                    <ConnectableComponent modelId={item.modelId} viewContext={item.displayContext} />
                </ItemView>);
            } else {
                return null;
            }
        });

        let classNames = classnames(this.props.className, 'selectable-multi-item-container');

        return (
            <div className={classNames}>
                {header}
                {grids}
            </div>
        );
    }
}
