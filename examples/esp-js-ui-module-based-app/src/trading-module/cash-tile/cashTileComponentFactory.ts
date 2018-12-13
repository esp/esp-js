import {Router} from 'esp-js';
import {PolimerModel} from 'esp-js-polimer';
import {ComponentFactoryBase, Logger, componentFactory, IdFactory} from 'esp-js-ui';
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
import {DateSelectorModel} from './store/dateSelector/dateSelectorModel';

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

        const modelId = IdFactory.createId('cashTileStore');

        const initialStore = state || defaultStoreFactory(modelId, 'EURUSD');

        let model = this._router
            // ***************************
            // Create a store and setup some initial state
            .storeBuilder<CashTileStore>()
            .withInitialStore(initialStore)

            // ***************************
            // Wire up state handlers.
            // 2 methods are supported.

            // 1) Simple handler objects
            .withStateHandlerMap('rootState', rootStateHandlerMap)
            .withStateHandlerMap('referenceData', referenceDataStateHandlerMap)
            .withStateHandlerMap('inputs', inputStateHandlerMap)
            // 2) Handlers within a container
            //    Useful if you want to use dependency injection, or attribute based stream wire-up
            .withStateHandlerObject('requestForQuote', new RequestForQuoteStateHandlers())
            // 3) Handlers which are objects that have a `getState` function or a function decorated with @polimerStateProvider
            //    These are useful if you have existing plumbing, or OO objects which you want to interop with polimer like stores
            //    There are some caveats here:
            //    - The public api to the model should be accessed via events.
            //      If you have methods which get called by some background process there is now way for esp to know the state has changed.
            //      e.g. Methods such as `myObject.setTheValue('theValue');` happen outside of esp.
            //           if `setTheValue` has an `@observeEvent` decorator then esp knows when that event was raised and thus the objects state may have changed
            //           In short, any changes to the models state have to happen on a dispatch loop for the owning model, in this case the PolimerModel<CashTileStore> created by this builder
            .withStateHandlerModel('dateSelector', new DateSelectorModel(modelId, this._router))

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