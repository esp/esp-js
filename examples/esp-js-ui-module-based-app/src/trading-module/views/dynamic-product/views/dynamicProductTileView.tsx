import * as React from 'react';
import {Logger} from 'esp-js-ui';
import {DynamicProductTileModel} from '../model/dynamicProductTileModel';
import {PublishModelEventContext, PublishModelEventDelegate} from 'esp-js-react';
import {DynamicProductEvents} from '../events';
import {Product, ProductType} from '../model';
import {TileContainerView} from '../../../../common/ui-components/tileContainerView';
import {SwapView} from './product/swap/swapView';
import {OptionView} from './product/option/optionView';
import {AddProductView} from './addProduct/addProductView';
import './dynamicProductTileView.css';

const _log: Logger = Logger.create('DynamicProductTileView');

export interface DynamicProductTileViewProps {
    model: DynamicProductTileModel;
}

const getProductView = (product: Product) => {
    if (product.productType === ProductType.swap) {
        return (<SwapView product={product}/>);
    } else if (product.productType === ProductType.option) {
        return (<OptionView product={product}/>);
    } else {
        throw new Error(`Unknown productType ${product.productType}`);
    }
};

export const DynamicProductTileView = ({model}: DynamicProductTileViewProps) => {
    let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    const removeProduct = (entityKey: string) => publishEvent(DynamicProductEvents.AddProduct.removeProduct_removed, {entityKey: entityKey} as DynamicProductEvents.AddProduct.RemoveProductEvent);
    return (
        <TileContainerView title='Dynamic Product' modelId={model.modelId} classNames='dynamicProductTileView'>
            <AddProductView productTypeSelectorSelectedValue={model.addProduct.productTypeSelectorSelectedValue} />
            <div className='dynamicGrid'>
                {Array.from(model.products.values()).map(product => {
                    return (
                        <div key={product.productModelConfiguration.entityKey}>
                            <div className='dynamicHeader'>
                                <div>
                                    {product.productType}
                                </div>
                                <button className='closeButton' onClick={() => removeProduct(product.productModelConfiguration.entityKey)}>X</button>
                            </div>
                            {getProductView(product)}
                        </div>
                    );
                })}
            </div>
        </TileContainerView>
    );
};