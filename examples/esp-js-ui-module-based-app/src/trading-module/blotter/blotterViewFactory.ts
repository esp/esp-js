import {Router} from 'esp-js';
import {ViewFactoryBase, Logger, viewFactory } from 'esp-js-ui';
import {TradingModuleContainerConst} from '../tradingModuleContainerConst';
import {BlotterState} from './models/blotterState';
import {BlotterModel} from './models/blotterModel';
import {PersistedViewState} from 'esp-js-ui';

const _log = Logger.create('BlotterViewFactory');

@viewFactory(TradingModuleContainerConst.blotterViewFactory, 'Blotter', 1)
export class BlotterViewFactory extends ViewFactoryBase<BlotterModel, BlotterState> {
    private _router : Router;

    constructor(container, router:Router) {
        super(container);
        this._router = router;
    }

    public get stateVersion(): number {
        return 1;
    }

    // override
    _createView(childContainer, persistedViewState?: PersistedViewState<BlotterState>):BlotterModel {
        _log.verbose('Creating blotter model');
        const blotterState = persistedViewState ? persistedViewState.state : {  };
        let model:BlotterModel = childContainer.resolve(TradingModuleContainerConst.blotterModel, blotterState);
        model.observeEvents();
        return model;
    }
}
