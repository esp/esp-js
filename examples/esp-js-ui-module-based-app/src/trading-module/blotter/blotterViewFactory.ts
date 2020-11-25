import {Router} from 'esp-js';
import {ViewFactoryBase, Logger, viewFactory } from 'esp-js-ui';
import {TradingModuleContainerConst} from '../tradingModuleContainerConst';
import {BlotterState} from './models/blotterState';
import {BlotterModel} from './models/blotterModel';

const _log = Logger.create('BlotterViewFactory');

@viewFactory(TradingModuleContainerConst.blotterViewFactory, 'Blotter')
export class BlotterViewFactory extends ViewFactoryBase<BlotterModel> {
    private _router : Router;

    constructor(container, router:Router) {
        super(container);
        this._router = router;
    }

    public get stateVersion(): number {
        return 1;
    }

    // override
    _createView(childContainer, state:BlotterState):BlotterModel {
        _log.verbose('Creating blotter model');
        state = state || BlotterState.create();
        let model:BlotterModel = childContainer.resolve(TradingModuleContainerConst.blotterModel, state);
        model.observeEvents();
        return model;
    }
}
