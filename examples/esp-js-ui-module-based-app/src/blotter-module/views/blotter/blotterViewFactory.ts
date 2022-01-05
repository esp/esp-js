import {Router} from 'esp-js';
import {ViewFactoryBase, Logger, viewFactory, RegionRecordState } from 'esp-js-ui';
import {BlotterState} from './model/blotterState';
import {BlotterModel} from './model/blotterModel';
import {BlotterModuleContainerConst} from '../../blotterModuleContainerConst';

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
    _createView(childContainer, regionRecordState?: RegionRecordState<BlotterState>):BlotterModel {
        _log.verbose('Creating blotter model');
        const blotterState = regionRecordState ? regionRecordState.viewState : {  };
        let model:BlotterModel = childContainer.resolve(BlotterModuleContainerConst.blotterModel, blotterState);
        model.observeEvents();
        return model;
    }
}
