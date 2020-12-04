import {ConnectableComponent} from 'esp-js-react';
import * as React from 'react';
import * as classnames from 'classnames';
import {Region} from '../models';
import {Logger} from '../../../core';

const _log = Logger.create('SingleItemRegionView');

export interface SingleItemRegionViewProps {
    model: Region;
    className?: string;
}

export const SingleItemRegionView = ({model, className}: SingleItemRegionViewProps) => {
    _log.verbose('Rendering');
    if (!model || !model.selectedItem) {
        return null;
    }
    let classNames = classnames(className, 'single-item-container');
    return (
        <div className={classNames}>
            <ConnectableComponent
                modelId={model.selectedItem.modelId}
                viewContext={model.selectedItem.displayContext}
            />
        </div>
    );
};