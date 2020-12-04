import * as React from 'react';
import {ConnectableComponent, PublishModelEventContext, PublishModelEventDelegate} from 'esp-js-react';
import * as classnames from 'classnames';
import {Logger} from '../../../core';
import {ItemView} from './itemView';
import {Region} from '../models';
import {RegionItem} from '../models';
import {EspUiEventNames} from '../../espUiEventNames';

const _log = Logger.create('MultiItemRegionView');

export interface SelectableMultiItemViewProps {
    model: Region;
    className?: string;
}

export const SelectableMultiItemView =  ({model, className}: SelectableMultiItemViewProps) => {
    _log.verbose('Rendering');

    let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    const onItemClicked = (item: RegionItem) =>  publishEvent(EspUiEventNames.regions_multiItemRegion_selectedItemChanged, { selectedItem: item });

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
            let buttonClassNames = classnames(className, {
                'item-header': true,
                'is-selected': item === model.selectedItem
            });

            return (<div
                onClick={() => onItemClicked(item)}
                key={item.id}
                className={buttonClassNames}>{item.displayOptions && item.displayOptions.title || 'Item'}
            </div>);
        });
        header = (<div className='item-header-container'>{headerButtons}</div>);
    }
    let grids = model.items.map((item: RegionItem) => {
        if(item === selectedItem) {
            return (<ItemView key={item.id} className='single-item-view-container'>
                <ConnectableComponent modelId={item.modelId} viewContext={item.displayContext} />
            </ItemView>);
        } else {
            return null;
        }
    });
    let classNames = classnames(className, 'selectable-multi-item-container');
    return (
        <div className={classNames}>
            {header}
            {grids}
        </div>
    );
};
