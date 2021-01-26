import * as React from 'react';
import * as classnames from 'classnames';
import {Region} from '../models';
import {RegionItemRecordView} from './regionItemRecordView';

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
    return (<RegionItemRecordView
        key={model.selectedRecord.id}
        regionItemRecord={model.selectedRecord}
        className={classNames}
        showLoadingUi={showLoadingUi}
        loadingMessage={loadingMessage}
    />);
};