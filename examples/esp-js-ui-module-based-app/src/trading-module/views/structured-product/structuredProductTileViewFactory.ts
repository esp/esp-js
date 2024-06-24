import {Router, Logger} from 'esp-js';
import {PolimerModel} from 'esp-js-polimer';
import {TradingModuleContainerConst} from '../../tradingModuleContainerConst';
import {StructureProductTileModel, StructureProductTileModelBuilder} from './model/structureProductTileModel';
import {AddNewProductEventStream} from './model/products/productStateEventStreams';
import {ProductsStateHandler} from './model/products/productsStateHandlers';
import {ViewFactoryBase} from 'esp-js-ui';
import {viewFactory} from 'esp-js-ui';
import {StructuredProductEvents} from './events';

const _log = Logger.create('CashTileViewFactory');

@viewFactory(TradingModuleContainerConst.cashTileViewFactory, 'Structured Product Tile', 1)
export class StructuredProductTileViewFactory extends ViewFactoryBase<PolimerModel<StructureProductTileModel>, { }> {
    private _router : Router;
    private _tileIdSeed = 1;

    constructor(container, router:Router) {
        super(container);
        this._router = router;
    }
    _createView(childContainer): PolimerModel<StructureProductTileModel> {
        _log.verbose('Creating structure product tile model');

        const model = StructureProductTileModelBuilder.createDefault(`sp-tile-${this._tileIdSeed++}`);

        let polimerModel = this._router
            .modelBuilder<StructureProductTileModel>()
            .withInitialModel(model)
            // event stream that expands the model by adding new products and their associated handlers
            .withEventStreamsOn(new AddNewProductEventStream(model.modelId, this._router))
            // state handler that acts on the entire ModelMapState, this is just treating it like any other state handler, no special Polimer behaviour
            .withStateHandlerObject('products', new ProductsStateHandler())
            .registerWithRouter();

        this._router.publishEvent(model.modelId, StructuredProductEvents.bootstrap, {});

        return polimerModel;
    }
}