import {ConnectableComponent} from 'esp-js-react';
import * as React from 'react';
import * as classnames from 'classnames';
import {Logger} from '../../../core';
import {ItemView} from './itemView';
import {Region, RegionItemRecord} from '../models';

const _log = Logger.create('MultiItemRegionView');

export interface MultiItemRegionViewProps {
    model: Region;
    className?: string;
    showLoadingUi?: boolean;
    loadingMessage?: string;
}

/**
 * Basic region view which displays multiple regions.
 *
 * Typically you'll implement a custom one of these depending on the app.
 * @constructor
 */
export const MultiItemRegionView = ({model, className, showLoadingUi, loadingMessage}: MultiItemRegionViewProps) => {
    _log.verbose('Rendering');
    if (!model) {
        return null;
    }
    if (model.regionRecords.length === 0) {
        // if there are no items we don't want to spit out any html which may affect layout
        return null;
    }
    let items = model.regionRecords.map((regionItemRecord: RegionItemRecord) => {
        _log.verbose(`Adding view for region item record: [${regionItemRecord.toString()}]`);
        let loadingComponent = showLoadingUi ? (<div>{loadingMessage ? loadingMessage : 'Waiting For View To Load'}</div>) : null;
        return (<ItemView key={regionItemRecord.id}>
            {regionItemRecord.modelCreated
                ? <ConnectableComponent modelId={regionItemRecord.modelId} viewContext={regionItemRecord.displayContext}/>
                : loadingComponent
            }
        </ItemView>);
    });
    let classNames = classnames(className, 'multi-item-container');
    return (
        <div className={classNames}>
            {items}
        </div>
    );
};
