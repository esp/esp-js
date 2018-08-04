import {ConnectableComponent} from 'esp-js-react';
import * as React from 'react';
import * as classnames from 'classnames';
import { Logger } from '../../../../core';
import {SingleItemRegionModel} from '../model/singleItemRegionModel';
import {ViewBase, ViewBaseProps} from '../../../viewBase';

const _log = Logger.create('SingleItemRegionView');

export interface SingleItemRegionViewProps extends ViewBaseProps<SingleItemRegionModel> {
    className?: string;
}

export class SingleItemRegionView extends ViewBase<SingleItemRegionView, SingleItemRegionModel, SingleItemRegionViewProps> {
    render() {
        _log.verbose('Rendering');

        let model : SingleItemRegionModel = this.props.model;

        if(!model) {
            return null;
        }

        if(model.item) {
            let className = classnames(this.props.className, 'single-item-container');
            return (
                <div className={className}>
                    <ConnectableComponent modelId={model.item.modelId} viewContext={model.item.displayContext} />
                </div>
            );
        } else {
            // if there is no item we don't want to spit out any html which may affect layout
            return null;
        }
    }
}