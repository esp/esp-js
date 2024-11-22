import * as React from 'react';
import {Product} from '../../../model';
import {CurrencyPairView, CutsView, EntityKeyView, NumericFieldView} from '../fields';
import {DynamicProductEvents} from '../../../events';

export interface OptionViewProps {
    product: Product;
}

export const OptionView = ({product}: OptionViewProps) => {
    let entityKey = product.productModelConfiguration.entityKey;
    return (
        <div className='dynamicBody'>
            <EntityKeyView entityKey={entityKey} />
            <CurrencyPairView
                entityKey={entityKey}
                selectedCurrencyPair={product.ccyPairField.ccyPair}
            />
            <NumericFieldView
                fieldName={product.barrier1.fieldName}
                entityKey={entityKey}
                numericValue={product.barrier1.barrier}
                changeEventType={DynamicProductEvents.Products.Option.barrier1_changed}
            />
            <NumericFieldView
                fieldName={product.barrier2.fieldName}
                entityKey={entityKey}
                numericValue={product.barrier2.barrier}
                changeEventType={DynamicProductEvents.Products.Option.barrier2_changed}
            />
            <CutsView cuts={product.cuts} />
        </div>
    );
};
