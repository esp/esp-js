import {Router} from 'esp-js';
import {ComponentFactoryBase, Logger, componentFactory } from 'esp-js-ui';
import CashTileState from './models/cashTileState';
import CashTileModel from './models/cashTileModel';
import TradingModuleContainerConst from '../tradingModuleContainerConst';

let _log = Logger.create('CashTileComponentFactory');

@componentFactory('tradingModule_cashTileComponentFactory', 'Cash Tile')
export default class CashTileComponentFactory extends ComponentFactoryBase {
    private _router : Router;
    constructor(container, router:Router) {
        super(container);
        this._router = router;
    }
    // override
    _createComponent(childContainer, state:CashTileState):CashTileModel {
        _log.verbose('Creating cash tile model');
        state = state || CashTileState.createNew();
        let model:CashTileModel = childContainer.resolve(TradingModuleContainerConst.cashTileModel, state);
        model.observeEvents();
        return model;
    }
}
