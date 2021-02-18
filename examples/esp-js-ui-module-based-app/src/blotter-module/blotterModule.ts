import * as uuid from 'uuid';
import {Container, EspDiConsts} from 'esp-js-di';
import {espModule, Logger, ModelBase, ModuleBase, PrerequisiteRegister, RegionItemRecord, SystemContainerConst, ViewFactoryBase} from 'esp-js-ui';
import {BlotterViewFactory} from './blotter/blotterViewFactory';
import {BlotterModel} from './blotter/models/blotterModel';
import {RegionNames} from '../shell/regionNames';
import {BlotterModuleContainerConst} from './blotterModuleContainerConst';
import {AccountsRefDataService} from './blotter/services/accountsRefDataService';
import {ModuleLoadStage} from 'esp-js-ui';

let _log = Logger.create('BlotterModule');

@espModule('blotter-module', 'Blotter Module')
export class BlotterModule extends ModuleBase {
    _viewFactoryGroupId: string = uuid.v4();

    constructor(container: Container) {
        super(container);
    }

    configureContainer() {
        _log.debug(`Registering Module Components`);

        // Services
        this.container
            .register(BlotterModuleContainerConst.accountsRefDataService, AccountsRefDataService)
            .singleton();

        this.container
            .register(BlotterModuleContainerConst.blotterViewFactory, BlotterViewFactory)
            .inject(EspDiConsts.owningContainer, SystemContainerConst.router)
            .singleton()
            .inGroup(this._viewFactoryGroupId);
        this.container
            .register(BlotterModuleContainerConst.blotterModel, BlotterModel)
            .inject(SystemContainerConst.router, SystemContainerConst.region_manager, BlotterModuleContainerConst.accountsRefDataService)
            .singletonPerContainer();
    }

    getViewFactories(): Array<ViewFactoryBase<ModelBase, any>> {
        return this.container.resolveGroup(this._viewFactoryGroupId);
    }

    registerPrerequisites(register: PrerequisiteRegister): void {
        const accountsRefDataService = this.container.resolve<AccountsRefDataService>(BlotterModuleContainerConst.accountsRefDataService);
        register.registerStream(accountsRefDataService.loadAccounts(), 'Loading Accounts (should take a while)');
    }

    // onLoadStageChanged(stage: ModuleLoadStage) {
    //     if (stage === ModuleLoadStage.Loaded) {
    //         this._ensureBlotterLoaded();
    //     }
    // }
    //
    // private _ensureBlotterLoaded() {
    //     // ESP loads views into regions based on state provided by an AppDefaultStateProvider instance.
    //     // This is part of an overall feature set which allows regions to persist and hydrate the state of views.
    //     //
    //     // There may be cases where a new view is released after the users has some local state already
    //     // In such cases AppDefaultStateProvider would have been amended to provide the new state, however ESP won't merge in that new state to the users existing state (as it can't know what to do).
    //     // For such cases, the module can just run some pre init code to ensure any new views are setup.
    //     //
    //     // The other alternative would be to delete any local storage state before a new release but often that's rather disruptive to users with complicated setups.
    //     const blotterWasLoaded = this.regionManager.existsInRegion(
    //         RegionNames.blotterRegion,
    //         (regionRecord: RegionItemRecord) => regionRecord.viewFactoryMetadata.viewKey === BlotterModuleContainerConst.blotterViewFactory
    //     );
    //     if (!blotterWasLoaded) {
    //         let blotterViewFactory = this.container.resolve<BlotterViewFactory>(BlotterModuleContainerConst.blotterViewFactory);
    //         let blotterModel = blotterViewFactory.createView();
    //         this.regionManager.addToRegion(RegionNames.blotterRegion, blotterModel.modelId);
    //     }
    // }

    public get supportsNewStateApi(): boolean {
        return true;
    }
}