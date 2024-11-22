import * as React from 'react';
import {usePublishModelEvent} from 'esp-js-react';
import {DynamicProductEvents} from '../../events';
import {ProductType} from '../../model';

export interface AddProductViewProps {
    productTypeSelectorSelectedValue: ProductType;
}

export const AddProductView = ({productTypeSelectorSelectedValue}: AddProductViewProps) => {
    let publishModelEvent = usePublishModelEvent();

    const onProductTypeChanged = (event) => publishModelEvent(DynamicProductEvents.AddProduct.productTypeChange, {productType: event.target.value} as DynamicProductEvents.AddProduct.ProductTypeSelectorChanged);
    const addProduct: () => void = React.useCallback(
        () => publishModelEvent(DynamicProductEvents.AddProduct.addProduct_requested, {}),
        []
    );
    return (
        <>
            <select id='productTypeSelector' value={productTypeSelectorSelectedValue} onChange={onProductTypeChanged}>
                <option value={ProductType.option}>Option</option>
                <option value={ProductType.swap}>Swap</option>
            </select>
            <button onClick={addProduct}>Add Product</button>
        </>
    );
};