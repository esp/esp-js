import {Router, Logger} from 'esp-js';
import {PolimerModel} from 'esp-js-polimer';
import {TradingModuleContainerConst} from '../../tradingModuleContainerConst';
import {ViewFactoryBase, viewFactory} from 'esp-js-ui';
import {StructuredProductEvents} from './events';
import {AddNewProductEventStream, AddProductsStateHandler, ProductDateStateHandler, StructureProductTileModel, StructureProductTileModelBuilder} from './model';

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
            // ProductDateStateHandler is a narrower type of handler which works with instances of Product inside the specific StateMap 'products'.
            // It's registered here and will apply to all products that get put in to the 'products' StateMap
            // See AddNewProductEventStream and AddProductsStateHandler for examples of how products get added.
            .withStateHandlerObject('products', new ProductDateStateHandler())
            // event stream that expands the model by adding new products and their associated handlers
            .withEventStreamsOn(new AddNewProductEventStream(model.modelId, this._router))
            // state handler that acts on the entire ModelMapState, this is just treating it like any other state handler, no special Polimer behaviour
            .withStateHandlerObject('products', new AddProductsStateHandler())
            .registerWithRouter();

        this._router.publishEvent(model.modelId, StructuredProductEvents.bootstrap, {});

        return polimerModel;
    }
}