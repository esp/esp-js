import * as React from 'react';
import {usePublishModelEventWithEntityKey} from 'esp-js-react';
import {DynamicProductEvents} from '../../../events';

export interface CurrencyPairViewProps {
    entityKey: string;
    selectedCurrencyPair: string;
}

export const CurrencyPairView = ({selectedCurrencyPair, entityKey}: CurrencyPairViewProps) => {
    let publishModelEventWithEntityKey = usePublishModelEventWithEntityKey();
    return (
        <>
            <div>CCY Pair</div>
            <div>
                <select
                    id='ccypairSelector'
                    value={selectedCurrencyPair}
                    onChange={(value) => publishModelEventWithEntityKey(
                        entityKey,
                        DynamicProductEvents.Products.CommonProductEvents.ccyPair_changed,
                        {newCcyPair: value.target.value} as DynamicProductEvents.Products.CommonProductEvents.CcyPairChangedEvent
                    )}
                >
                    <option value='EURUSD'>EURUSD</option>
                    <option value='USDJPY'>USDJPY</option>
                    <option value='GBPAUD'>GBPAUD</option>
                </select>
            </div>
        </>

    );
};