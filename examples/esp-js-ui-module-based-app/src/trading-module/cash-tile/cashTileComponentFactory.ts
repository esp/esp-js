import {Router} from 'esp-js';
import {PolimerModel} from 'esp-js-polimer';
import {ComponentFactoryBase, Logger, componentFactory} from 'esp-js-ui';
import {CashTileStore, defaultStoreFactory} from './store/cashTileStore';
import {CashTileView} from './views/cashTileView';
import {rootStateHandlerMap} from './store/root/rootState';
import {referenceDataStateHandlerMap} from './store/refData/referenceDataState';
import {rootStateObservable} from './store/root/rootEventStreams';
import {inputStateHandlerMap} from './store/inputs/inputsState';
import {RequestForQuoteStateHandlers} from './store/rfq/requestForQuoteState';
import {RequestForQuoteEventStreams} from './store/rfq/requestForQuoteEventStreams';
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
            // ***************************
            // Create a store and setup some initial state
            .storeBuilder<CashTileStore>()
            .withInitialStore(initialStore)

            // ***************************
            // Wire up state handlers.
            // 2 methods are supported.

            // 1) Simple handler objects
            .withStateHandler('rootState', rootStateHandlerMap)
            .withStateHandler('referenceData', referenceDataStateHandlerMap)
            .withStateHandler('inputs', inputStateHandlerMap)
            // 2) Handlers within a container
            //    Useful if you want to use dependency injection, or attribute based stream wire-up
            .withStateHandlersOn('requestForQuote', new RequestForQuoteStateHandlers())

            // ***************************
            // Wire up our event streams
            // 2 methods are supported

            // 1) Simple handler objects
            //    If you need to inject dependencies into the event streams you'd wrap the functions here, i.e. rootStateObservable(myDependency)
            .withEventStreams(rootStateObservable)
            // 2) Handlers within a container.
            //    Useful if you want to use dependency injection, or attribute based stream wire-up
            .withEventStreamsOn(new RequestForQuoteEventStreams(new RfqService()))

            // ***************************
            // Add some view bindings for this store.
            // Used by ConnectableComponent to render a view for the store
            .withViewBindings(CashTileView)

            // ***************************
            // finally create and register it with the model (the ordering of hte above isn't important, however this method must be called last)
            .registerWithRouter();

        this._router.publishEvent(model.modelId, RootEvents.bootstrap, {});

        return model;
    }
}