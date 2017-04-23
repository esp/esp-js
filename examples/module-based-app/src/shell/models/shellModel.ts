import { observeEvent } from 'esp-js';
import { viewBinding } from 'esp-js-react';
import ShellView from '../views/shellView';
import {
    Logger,
    ModelBase,
    MultiItemRegionModel,
    SingleItemRegionModel,
    ModuleLoader,
    IdFactory
} from 'esp-js-ui';

let _log = Logger.create('ShellModel');

@viewBinding(ShellView)
export default class ShellModel extends ModelBase {
    private _workspaceRegion:MultiItemRegionModel;
    private _blotterRegion:SingleItemRegionModel;

    constructor(router,
                workspaceRegion:MultiItemRegionModel,
                blotterRegion:SingleItemRegionModel
    ) {
        super(IdFactory.createId('shellModelId'), router);
        this._workspaceRegion = workspaceRegion;
        this._blotterRegion = blotterRegion;
    }
    observeEvents() {
        super.observeEvents();
        this._blotterRegion.observeEvents();
        this._workspaceRegion.observeEvents();
    }

    getTitle() : string {
        return 'Shell';
    }

    get workspaceRegion() {
        return this._workspaceRegion;
    }

    get blotterRegion() {
        return this._blotterRegion;
    }
}
