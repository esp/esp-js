import {Router} from 'esp-js';
import {PolimerModel} from 'esp-js-polimer';
import {ViewFactoryBase, Logger,  viewFactory, IdFactory} from 'esp-js-ui';
import {CashTileModel, defaultModelFactory} from './model/cashTileModel';
import {CashTileView} from './views/cashTileView';
import {rootStateHandlerMap} from './model/root/rootState';
import {referenceDataStateHandlerMap} from './model/refData/referenceDataState';
import {rootStateObservable} from './model/root/rootEventStreams';
import {inputStateHandlerMap} from './model/inputs/inputsState';
import {RequestForQuoteStateHandlers} from './model/rfq/requestForQuoteState';
import {RequestForQuoteEventStreams} from './model/rfq/requestForQuoteEventStreams';
import {RfqService} from './services/rfqService';
import {RootEvents} from './events';
import {DateSelectorModel} from './model/dateSelector/dateSelectorModel';
import {TradingModuleContainerConst} from '../tradingModuleContainerConst';

const _log = Logger.create('CashTileViewFactory');

@viewFactory(TradingModuleContainerConst.cashTileViewFactory, 'Cash Tile')
export class CashTileViewFactory extends ViewFactoryBase<PolimerModel<CashTileModel>> {
    private _router : Router;
    constructor(container, router:Router) {
        super(container);
        this._router = router;
    }
    _createView(childContainer, state: CashTileModel): PolimerModel<CashTileModel> {
        _log.verbose('Creating cash tile model');

        const modelId = IdFactory.createId('cashTileModel');

        const initialModel = state || defaultModelFactory(modelId, 'EURUSD');

        let model = this._router
            // ***************************
            // Create a model and setup some initial state
            .modelBuilder<CashTileModel>()
            .withInitialModel(initialModel)

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
            // 3) Handlers which are objects that have a function named getEspPolimerState()
            //    These are useful if you have existing plumbing, or OO objects which you want to interop with polimer like immutable models
            //    There are some caveats here:
            //    - The public api to the model should be accessed via events.
            //      If you have methods which get called by some background process there is now way for esp to know the state has changed.
            //      e.g. Methods such as `myObject.setTheValue('theValue');` happen outside of esp.
            //           if `setTheValue` has an `@observeEvent` decorator then esp knows when that event was raised and thus the objects state may have changed
            //           In short, any changes to the models state have to happen on a dispatch loop for the owning model, in this case the PolimerModel<CashTileModel> created by this builder
            .withStateHandlerModel('dateSelector', new DateSelectorModel(modelId, this._router), true)

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
            // Add some view bindings for this model.
            // Used by ConnectableComponent to render a view for the model
            .withViewBindings(CashTileView)

            // ***************************
            // finally create and register it with the model (the ordering of hte above isn't important, however this method must be called last)
            .registerWithRouter();

        this._router.publishEvent(model.modelId, RootEvents.bootstrap, {});

        return model;
    }
}