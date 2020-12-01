import {Router} from 'esp-js';
import {PolimerModel} from 'esp-js-polimer';
import {ViewFactoryBase, Logger,  viewFactory, IdFactory} from 'esp-js-ui';
import {CashTileModel, CashTileStateUtils} from './model/cashTileModel';
import {CashTileView} from './views/cashTileView';
import {RootStateEventStreams} from './model/root/rootEventStreams';
import {InputStateHandlers} from './model/inputs/inputsState';
import {RequestForQuoteStateHandlers} from './model/rfq/requestForQuoteState';
import {RequestForQuoteEventStreams} from './model/rfq/requestForQuoteEventStreams';
import {RfqService} from './services/rfqService';
import {RootEvents} from './events';
import {DateSelectorModel} from './model/dateSelector/dateSelectorModel';
import {TradingModuleContainerConst} from '../tradingModuleContainerConst';
import {ReferenceDataStateHandlers} from './model/refData/referenceDataState';
import {RootStateHandlers} from './model/root/rootState';
import * as uuid from 'uuid';
import {CashTileState} from './state/stateModel';

const _log = Logger.create('CashTileViewFactory');

@viewFactory(TradingModuleContainerConst.cashTileViewFactory, 'Cash Tile')
export class CashTileViewFactory extends ViewFactoryBase<PolimerModel<CashTileModel>, CashTileState> {
    private _router : Router;
    constructor(container, router:Router) {
        super(container);
        this._router = router;
    }
    _createView(childContainer, state: CashTileState): PolimerModel<CashTileModel> {
        _log.verbose('Creating cash tile model');

        const modelId = IdFactory.createId('cashTileModel');

        const initialModel = CashTileStateUtils.createDefaultState(uuid.v4(), state);

        this._router.publishEvent(model.modelId, RootEvents.bootstrap, {});

        let model = this._router
            // ***************************
            // Create a model and setup some initial state
            .modelBuilder<CashTileModel>()
            .withInitialModel(initialModel)

            // ***************************
            // Wire up state handlers.
            .withStateHandlerObject('rootState', new RootStateHandlers())
            .withStateHandlerObject('referenceData', new ReferenceDataStateHandlers())
            .withStateHandlerObject('inputs', new InputStateHandlers())
            .withStateHandlerObject('requestForQuote', new RequestForQuoteStateHandlers())

            // ***************************
            // Wire up state event streams (i.e. async operations)
            .withEventStreamsOn(new RootStateEventStreams())
            .withEventStreamsOn(new RequestForQuoteEventStreams(new RfqService()))


            // ***************************
            // Wire up legacy OO model interactions (unlikely you'll need this):
            //
            // Handlers which are objects that have a function named getEspPolimerState()
            // These are useful if you have existing plumbing, or OO objects which you want to interop with polimer like immutable models
            // There are some caveats here:
            // - The public api to the model should be accessed via events.
            //   If you have methods which get called by some background process there is now way for esp to know the state has changed.
            //   e.g. Methods such as `myObject.setTheValue('theValue');` happen outside of esp.
            //        if `setTheValue` has an `@observeEvent` decorator then esp knows when that event was raised and thus the objects state may have changed
            //        In short, any changes to the models state have to happen on a dispatch loop for the owning model, in this case the PolimerModel<CashTileModel> created by this builder
            .withStateHandlerModel('dateSelector', new DateSelectorModel(modelId, this._router), true)

            // ***************************
            // Add some view bindings for this model.
            // Used by ConnectableComponent to render a view for the model
            .withViewBindings(CashTileView)

            // ***************************
            // finally create and register it with the model (the ordering of hte above isn't important, however this method must be called last)
            .registerWithRouter();

        return model;
    }
}