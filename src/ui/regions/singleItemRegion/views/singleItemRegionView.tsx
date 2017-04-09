import {SmartComponent} from 'esp-js-react';
import * as React from 'react';
import * as classnames from 'classnames';
import { Logger } from '../../../../core';
import SingleItemRegionsModel from '../model/singleItemRegionsModel';
import ViewBase from '../../../viewBase';
import {IViewBaseProps} from '../../../viewBase';
import ISingleItemRegionViewProps from './ISingleItemRegionViewProps';

const _log = Logger.create('SingleItemRegionView');

export interface ISingleItemRegionViewProps extends IViewBaseProps<SingleItemRegionsModel> {
    className?: string;
}

export default class SingleItemRegionView extends ViewBase<SingleItemRegionView, SingleItemRegionsModel, ISingleItemRegionViewProps> {
    render() {
        _log.verbose('Rendering');

        let model : SingleItemRegionsModel = this.props.model;

        if(!model) {
            return null;
        }

        if(model.item) {
            let className = classnames(this.props.className, 'single-item-container');
            return (
                <div className={className}>
                    <SmartComponent modelId={model.item.modelId} viewContext={model.item.displayContext} />
                </div>
            );
        } else {
            // if there is no item we don't want to spit out any html which may affect layout
            return null;
        }
    }
}