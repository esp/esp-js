import {ConnectableComponent} from 'esp-js-react';
import * as React from 'react';
import * as classnames from 'classnames';
import {Region} from '../models';

export interface SingleItemRegionViewProps {
    model: Region;
    className?: string;
    showLoadingUi?: boolean;
    loadingMessage?: string;
}

/**
 * Basic region view which displays a single region item.
 *
 * Typically you'll implement a custom one of these depending on the app.
 * @constructor
 */
export const SingleItemRegionView = ({model, className, showLoadingUi, loadingMessage}: SingleItemRegionViewProps) => {
    if (!model || !model.selectedRecord) {
        return null;
    }
    let classNames = classnames(className, 'single-item-container');
    let loadingComponent = showLoadingUi ? (<div>{loadingMessage ? loadingMessage : 'Waiting For View To Load'}</div>) : null;
    return (
        <div className={classNames}>
            {model.selectedRecord.modelCreated
                ? <ConnectableComponent modelId={model.selectedRecord.regionItem.modelId} viewContext={model.selectedRecord.regionItem.displayContext}/>
                : loadingComponent
            }
        </div>
    );
};