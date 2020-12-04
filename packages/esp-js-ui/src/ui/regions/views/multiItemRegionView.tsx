import {ConnectableComponent} from 'esp-js-react';
import * as React from 'react';
import * as classnames from 'classnames';
import {Logger} from '../../../core';
import {ItemView} from './itemView';
import {Region, RegionItem} from '../models';

const _log = Logger.create('MultiItemRegionView');

export interface MultiItemRegionViewProps {
    model: Region;
    className?: string;
}

export const MultiItemRegionView = ({model, className}: MultiItemRegionViewProps) => {
    _log.verbose('Rendering');
    if (!model) {
        return null;
    }
    if (model.items.length === 0) {
        // if there are no items we don't want to spit out any html which may affect layout
        return null;
    }
    let items = model.items.map((regionItem: RegionItem) => {
        _log.verbose(`Adding view for region item: [${regionItem.toString()}]`);
        return (<ItemView key={regionItem.id}>
            <ConnectableComponent modelId={regionItem.modelId} viewContext={regionItem.displayContext}/>
        </ItemView>);
    });
    let classNames = classnames(className, 'multi-item-container');
    return (
        <div className={classNames}>
            {items}
        </div>
    );
};
