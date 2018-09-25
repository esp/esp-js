import {Router} from 'esp-js';
import {PolimerModel} from 'esp-js-polimer';
import {ComponentFactoryBase, Logger, componentFactory} from 'esp-js-ui';
import {CashTileStore, defaultStoreFactory} from './store/cashTileStore';
import {CashTileView} from './views/cashTileView';
import {rootStateHandlerMap} from './store/root/rootState';
import {referenceDataStateHandlerMap} from './store/refData/referenceDataState';
import {rootStateObservable} from './store/root/rootObservables';
import {inputStateHandlerMap} from './store/inputs/inputsState';
import {RequestForQuoteStateHandlers} from './store/rfq/requestForQuoteState';
import {RequestForQuoteObservables} from './store/rfq/requestForQuoteObservables';
import {RfqService} from './services/rfqService';
import {RootEvents} from './events';

const _log = Logger.create('CashTileComponentFactory');

@componentFactory('tradingModule_cashTileComponentFactory', 'Cash Tile')
export class CashTileComponentFactory extends ComponentFactoryBase<PolimerModel<CashTileStore>> {
    private _router : Router;
    constructor(container, router:Router) {
        super(container);
        this._router = router;
    }
    // override
    _createComponent(childContainer, state: CashTileStore): PolimerModel<CashTileStore> {
        _log.verbose('Creating cash tile model');

        const initialStore = state || defaultStoreFactory('EURUSD');

        let model = this._router
            .storeBuilder<CashTileStore>('CashTileModel')

            // set the initial state for the store.
            .withInitialStore(initialStore)

            // this also works :
            .withStateHandler('rootState', rootStateHandlerMap)
            .withStateHandler('referenceData', referenceDataStateHandlerMap)
            .withStateHandler('inputs', inputStateHandlerMap)
            .withStateHandlersOn('requestForQuote', new RequestForQuoteStateHandlers())

            .withEventStreams(rootStateObservable) // if you need to inject dependencies into the event streams you'd wrap the functions here
            .withEventStreamsOn(new RequestForQuoteObservables(new RfqService())) // this syntax allows for DI

            // add some view bindings for this store
            .withViewBindings(CashTileView)

            // finally create and register it with the model (the ordering of hte above isn't important, however this method must be called last)
            .registerWithRouter();

        this._router.publishEvent(model.modelId, RootEvents.bootstrap, {});

        return model;
    }
}