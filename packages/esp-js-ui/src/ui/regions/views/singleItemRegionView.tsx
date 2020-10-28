import {ConnectableComponent} from 'esp-js-react';
import * as React from 'react';
import * as classnames from 'classnames';
import {ViewBase, ViewBaseProps} from '../../viewBase';
import {RegionModel} from '../models';
import {Logger} from '../../../core';

const _log = Logger.create('SingleItemRegionView');

export interface SingleItemRegionViewProps extends ViewBaseProps<RegionModel> {
    className?: string;
}

export class SingleItemRegionView extends ViewBase<SingleItemRegionView, RegionModel, SingleItemRegionViewProps> {
    render() {
        _log.verbose('Rendering');

        let model : RegionModel = this.props.model;

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