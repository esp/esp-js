import {Router} from 'esp-js';
import {ViewFactoryBase, Logger, viewFactory, RegionRecordState } from 'esp-js-ui';
import {AppPreferencesModel} from './model';
import {ShellModuleContainerConst} from '../../shellModuleContainerConst';

const _log = Logger.create('BlotterViewFactory');

@viewFactory(ShellModuleContainerConst.app_preferences_view_factory, 'App Preferences')
export class AppPreferencesViewFactory extends ViewFactoryBase<AppPreferencesModel, { }> {
    private _router : Router;

    constructor(container, router:Router) {
        super(container);
        this._router = router;
    }

    // override
    _createView(childContainer, regionRecordState?: RegionRecordState<{ }>):AppPreferencesModel {
        _log.verbose('Creating app preferences model');
        let model = childContainer.resolve(ShellModuleContainerConst.app_preferences_model);
        model.observeEvents();
        return model;
    }
}
