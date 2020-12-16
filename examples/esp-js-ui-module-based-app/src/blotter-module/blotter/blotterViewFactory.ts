import {Router} from 'esp-js';
import {ViewFactoryBase, Logger, viewFactory } from 'esp-js-ui';
import {BlotterState} from './models/blotterState';
import {BlotterModel} from './models/blotterModel';
import {PersistedViewState} from 'esp-js-ui';
import {BlotterModuleContainerConst} from '../blotterModuleContainerConst';

const _log = Logger.create('BlotterViewFactory');

@viewFactory(BlotterModuleContainerConst.blotterViewFactory, 'Blotter', 1)
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
        let model:BlotterModel = childContainer.resolve(BlotterModuleContainerConst.blotterModel, blotterState);
        model.observeEvents();
        return model;
    }
}
