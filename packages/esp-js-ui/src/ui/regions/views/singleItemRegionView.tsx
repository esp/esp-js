import {ConnectableComponent} from 'esp-js-react';
import * as React from 'react';
import * as classnames from 'classnames';
import {ViewBase, ViewBaseProps} from '../../viewBase';
import {Region} from '../models';
import {Logger} from '../../../core';

const _log = Logger.create('SingleItemRegionView');

export interface SingleItemRegionViewProps extends ViewBaseProps<Region> {
    className?: string;
}

export class SingleItemRegionView extends ViewBase<SingleItemRegionView, Region, SingleItemRegionViewProps> {
    render() {
        _log.verbose('Rendering');

        let model : Region = this.props.model;

        if(!model) {
            return null;
        }

        if(model.selectedItem) {
            let className = classnames(this.props.className, 'single-item-container');
            return (
                <div className={className}>
                    <ConnectableComponent
                        modelId={model.selectedItem.modelId}
                        viewContext={model.selectedItem.displayContext}
                    />
                </div>
            );
        } else {
            // if there is no item we don't want to spit out any html which may affect layout
            return null;
        }
    }
}