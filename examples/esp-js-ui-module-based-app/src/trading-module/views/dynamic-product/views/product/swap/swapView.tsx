import * as React from 'react';
import {Product} from '../../../model';
import {CurrencyPairView, EntityKeyView, NumericFieldView} from '../fields';
import {DynamicProductEvents} from '../../../events';

export interface SwapViewProps {
    product: Product;
}

export const SwapView = ({product}: SwapViewProps) => {
    let entityKey = product.productModelConfiguration.entityKey;
    return (
        <div className='dynamicBody'>
            <EntityKeyView entityKey={entityKey} />
            <CurrencyPairView
                entityKey={entityKey}
                selectedCurrencyPair={product.ccyPairField.ccyPair}
            />
            <NumericFieldView
                fieldName={product.swapPointsField.fieldName}
                entityKey={entityKey}
                numericValue={product.swapPointsField.swapPoints}
                changeEventType={DynamicProductEvents.Products.Swap.swapPoints_changed}
            />
        </div>
    );
};
