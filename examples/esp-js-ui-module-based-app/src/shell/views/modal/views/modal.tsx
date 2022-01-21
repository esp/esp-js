import {Region, SingleItemRegionView} from 'esp-js-ui';
import * as React from 'react';

export const ModalView = ({model}: { model: Region }) => {
    if (!model.selectedRecord) {
        return null;
    }
    return (
        <div className='modal'>
            <div className='modal_content'>
                <SingleItemRegionView model={model} showLoadingUi={true}/>
            </div>
        </div>
    );
};