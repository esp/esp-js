import * as React from 'react';
import {usePublishModelEventWithEntityKey} from 'esp-js-react';
import {DynamicProductEvents} from '../../../events';

export interface NumericFieldViewProps {
    fieldName: string;
    entityKey: string;
    numericValue: number;
    changeEventType: string;
}

export const NumericFieldView = ({fieldName, entityKey, changeEventType, numericValue}: NumericFieldViewProps) => {
    let publishModelEventWithEntityKey = usePublishModelEventWithEntityKey();
    return (
        <>
            <div>{fieldName}</div>
            <div>
                <input
                    type='number'
                    value={numericValue || ''}
                    onChange={(value) => publishModelEventWithEntityKey(
                        entityKey,
                        changeEventType,
                        {newValue: Number(value.target.value)} as DynamicProductEvents.Products.CommonProductEvents.NumericValueChangedEvent
                    )}
                />
            </div>
        </>
    );
};