import * as React from 'react';
import {PublishModelEventContext, PublishModelEventDelegate} from 'esp-js-react';
import * as classnames from 'classnames';
import {RegionItemRecordView} from './regionItemRecordView';
import {Region, RegionItemRecord, SelectedItemChangedEvent} from '../models';
import {EspUiEventNames} from '../../espUiEventNames';
import {Logger} from 'esp-js';

const _log = Logger.create('MultiItemRegionView');

export interface SelectableMultiItemViewProps {
    model: Region;
    className?: string;
}

/**
 * Basic region view which displays a collection of items and allows one to be selected.
 *
 * Typically you'll implement a custom one of these depending on the app.
 * @constructor
 */
export const SelectableMultiItemView =  ({model, className}: SelectableMultiItemViewProps) => {
    _log.verbose('Rendering');

    let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    const onItemClicked = (record: RegionItemRecord) =>  publishEvent(EspUiEventNames.regions_selectedItemChanged, { regionItemRecord: record } as SelectedItemChangedEvent );

    if(!model) {
        return null;
    }
    if(model.regionRecords.length === 0) {
        // if there are no items we don't want to spit out any html which may affect layout
        return null;
    }

    let selectedItem : RegionItemRecord = model.selectedRecord;
    if(!selectedItem) {
        selectedItem = model.regionRecords[0];
    }

    let header = null;
    if(model.regionRecords.length > 1) {
        let headerButtons = model.regionRecords.map((record: RegionItemRecord) => {
            const buttonClassNames = classnames(className, {
                'item-header': true,
                'is-selected': record === model.selectedRecord
            });
            return (<div
                onClick={() => onItemClicked(record)}
                key={record.id}
                className={buttonClassNames}>{record.title || 'Item'}
            </div>);
        });
        header = (<div className='item-header-container'>{headerButtons}</div>);
    }
    let grids = model.regionRecords.map((record: RegionItemRecord) => {
        if(record === selectedItem) {
            return (<RegionItemRecordView key={record.id} regionItemRecord={record} className='single-item-view-container' />);
        } else {
            return null;
        }
    });
    let classNames = classnames(className, 'selectable-multi-item-container');
    return (
        <div className={classNames}>
            {header}
            {grids}
        </div>
    );
};
