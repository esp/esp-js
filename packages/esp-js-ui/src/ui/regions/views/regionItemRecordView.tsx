import * as React from 'react';
import {RegionItemRecord} from '../models';
import {ConnectableComponent} from 'esp-js-react';

export interface RegionItemRecordViewProps  {
    regionItemRecord: RegionItemRecord;
    showLoadingUi?: boolean;
    loadingMessage?: string;
    className?: string;
    style?: any;
}

export class RegionItemRecordView extends React.Component<RegionItemRecordViewProps, any> {
    render() {
        const {regionItemRecord, showLoadingUi, loadingMessage, className, style} = this.props;
        let loadingComponent = null;
        if (showLoadingUi) {
            if (regionItemRecord.hasError) {
                loadingComponent = (<div>{loadingMessage ? loadingMessage : 'Load Error'}</div>);
            } else {
                loadingComponent = (<div>{loadingMessage ? loadingMessage : 'Waiting For View To Load'}</div>);
            }
        }
        return (
            <div style={style} className={className || 'item-item-container'}>
                {regionItemRecord.modelCreated
                    ? <ConnectableComponent modelId={regionItemRecord.modelId} viewContext={regionItemRecord.displayContext}/>
                    : loadingComponent
                }
            </div>
        );
    }
}
