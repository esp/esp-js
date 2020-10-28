import {ConnectableComponent} from 'esp-js-react';
import * as React from 'react';
import * as classnames from 'classnames';
import {Logger} from '../../../../core';
import {ItemView} from './itemView';
import {MultiItemRegionModel} from '../model/multiItemRegionModel';
import {ViewBase} from '../../../viewBase';
import {RegionItem} from '../../regionItem';
import {ViewBaseProps} from '../../../viewBase';

const _log = Logger.create('MultiItemRegionView');

export interface MultiItemRegionViewProps extends ViewBaseProps<MultiItemRegionModel> {
    className?: string;
}

export class MultiItemRegionView extends ViewBase<MultiItemRegionView, MultiItemRegionModel, MultiItemRegionViewProps> {
    render() {
        _log.verbose('Rendering');
        let model: MultiItemRegionModel = this.props.model;
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

        let className = classnames(this.props.className, 'multi-item-container');

        return (
            <div className={className}>
                {items}
            </div>
        );
    }
}
