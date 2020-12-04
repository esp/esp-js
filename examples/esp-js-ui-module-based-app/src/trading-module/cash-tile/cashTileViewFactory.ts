import {Router} from 'esp-js';
import {PolimerModel} from 'esp-js-polimer';
import {ViewFactoryBase, Logger,  viewFactory} from 'esp-js-ui';
import {CashTileView} from './views/cashTileView';
import {InputStateHandlers} from './model/inputs/inputsState';
import {RequestForQuoteStateHandlers} from './model/rfq/requestForQuoteState';
import {RequestForQuoteEventStreams} from './model/rfq/requestForQuoteEventStreams';
import {RfqService} from './services/rfqService';
import {TileEvents} from './events';
import {DateSelectorModel} from './model/dateSelector/dateSelectorModel';
import {TradingModuleContainerConst} from '../tradingModuleContainerConst';
import {ReferenceDataStateHandlers} from './model/refData/referenceDataState';
import {CashTilePersistedState} from './state/stateModel';
import {PersistedViewState} from 'esp-js-ui';
import {CashTileModel, CashTileModelBuilder} from './model/cashTileModel';
import {RefDataService} from './services/refDataService';

const _log = Logger.create('CashTileViewFactory');

@viewFactory(TradingModuleContainerConst.cashTileViewFactory, 'Cash Tile', 1)
export class CashTileViewFactory extends ViewFactoryBase<PolimerModel<CashTileModel>, CashTilePersistedState> {
    private _router : Router;
    private _cashTileIdSeed = 1;

    constructor(container, router:Router) {
        super(container);
        this._router = router;
    }
    _createView(childContainer, persistedViewState?: PersistedViewState<CashTilePersistedState>): PolimerModel<CashTileModel> {
        _log.verbose('Creating cash tile model');

        const model = CashTileModelBuilder.createDefault(`cash-tile-${this._cashTileIdSeed++}`, persistedViewState.state);

        // Get the ref data service from the container.
        // Note in non demo apps, typically all the handlers and objects below would be registered in the container.
        // This keeps dependency/object creation concerns in one place (also makes testing easier).
        let refDataService = this._container.resolve<RefDataService>(TradingModuleContainerConst.refDataService);

        let polimerModel = this._router
            // ***************************
            // Create a model and setup some initial state
            .modelBuilder<CashTileModel, CashTilePersistedState>()
            .withInitialModel(model)

            // ***************************
            // Wire up state handlers.
            .withStateHandlerObject('referenceData', new ReferenceDataStateHandlers(refDataService, model.modelId))
            .withStateHandlerObject('inputs', new InputStateHandlers())
            .withStateHandlerObject('requestForQuote', new RequestForQuoteStateHandlers())

            // ***************************
            // Wire up state event streams (i.e. async operations)
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
            .withStateHandlerModel('dateSelector', new DateSelectorModel(model.modelId, this._router, persistedViewState.state ? persistedViewState.state.tenor : null), true)

            // ***************************
            // Add some view bindings for this model.
            // Used by ConnectableComponent to render a view for the model
            .withViewBindings(CashTileView)

            .withStateSaveHandler((m: any) => this._saveState(m))

            // Runs after even dispatch loop for the model (i.e. when all events for the model in question are purged)
            .withPostEventProcessor(m => {
                _log.verbose(`Post event processing ${m.modelId}`);
            })

            // ***************************
            // finally create and register it with the model (the ordering of hte above isn't important, however this method must be called last)
            .registerWithRouter();

        this._router.publishEvent(model.modelId, TileEvents.bootstrap, {});

        return polimerModel;
    }

    private _saveState(model: CashTileModel): CashTilePersistedState {
        return {
            currencyPair: model.inputs.ccyPair,
            notional: model.inputs.notional,
            tenor: model.dateSelector.dateInput,
        };
    }
}