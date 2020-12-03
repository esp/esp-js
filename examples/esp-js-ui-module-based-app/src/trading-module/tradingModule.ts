import * as uuid from 'uuid';
import * as Rx from 'rx';
import {Container, EspDiConsts} from 'esp-js-di';
import {
    ModuleBase,
    SystemContainerConst,
    ViewFactoryBase,
    PrerequisiteRegister,
    Logger,
    ModelBase,
    RegionManager,
    espModule, RegionItemRecord
} from 'esp-js-ui';
import {TradingModuleContainerConst} from './tradingModuleContainerConst';
import {CashTileViewFactory} from './cash-tile/cashTileViewFactory';
import {BlotterViewFactory} from './blotter/blotterViewFactory';
import {BlotterModel} from './blotter/models/blotterModel';
import {RegionNames} from '../shell/regionNames';

let _log = Logger.create('TradingModule');

@espModule('trading-module', 'Trading Module')
export class TradingModule extends ModuleBase {
    _viewFactoryGroupId: string;

    constructor(container: Container) {
        super(container);
        this._viewFactoryGroupId = uuid.v4();
    }

    configureContainer() {
        _log.debug(`Registering ${TradingModuleContainerConst.cashTileViewFactory}`);
        this.container
            .register(TradingModuleContainerConst.cashTileViewFactory, CashTileViewFactory)
            .inject(EspDiConsts.owningContainer, SystemContainerConst.router)
            .singleton()
            .inGroup(this._viewFactoryGroupId);
        _log.debug(`Registering ${TradingModuleContainerConst.blotterViewFactory}`);
        this.container
            .register(TradingModuleContainerConst.blotterViewFactory, BlotterViewFactory)
            .inject(EspDiConsts.owningContainer, SystemContainerConst.router)
            .singleton()
            .inGroup(this._viewFactoryGroupId);
        _log.debug(`Registering ${TradingModuleContainerConst.blotterModel}`);
        this.container
            .register(TradingModuleContainerConst.blotterModel, BlotterModel)
            .inject(SystemContainerConst.router, SystemContainerConst.region_manager)
            .singletonPerContainer();
    }

    getViewFactories(): Array<ViewFactoryBase<ModelBase, any>> {
        return this.container.resolveGroup(this._viewFactoryGroupId);
    }

    registerPrerequisites(register: PrerequisiteRegister): void {
        _log.debug(`Registering 1`);
        register.registerStream(
            Rx.Observable.timer(2000).take(1).concat(Rx.Observable.throw(new Error('Load error'))),
            'Loading Module That Fails'
        );
        _log.debug(`Registering 2`);
        register.registerStream(Rx.Observable.timer(2000).take(1), 'Loading Referential Data');
    }

    onAppReady() {
        this._ensureBlotterLoaded();
    }

    private _ensureBlotterLoaded() {
        // ESP loads views into regions based on state provided by an AppDefaultStateProvider instance.
        // This is part of an overall feature set which allows regions to persist and hydrate the state of views.
        //
        // There may be cases where a new view is released after the users has some local state already
        // In such cases AppDefaultStateProvider would have been amended to provide the new state, however ESP won't merge in that new state to the users existing state (as it can't know what to do).
        // For such cases, the module can just run some pre init code to ensure any new views are setup.
        //
        // The other alternative would be to delete any local storage state before a new release but often that's rather disruptive to users with complicated setups.
        const blotterWasLoaded = this.regionManager.existsInRegion(
            RegionNames.blotterRegion,
            (regionRecord: RegionItemRecord) => regionRecord.viewFactoryMetadata.viewKey === TradingModuleContainerConst.blotterViewFactory
        );
        if (!blotterWasLoaded) {
            let blotterViewFactory = this.container.resolve<BlotterViewFactory>(TradingModuleContainerConst.blotterViewFactory);
            let blotterModel = blotterViewFactory.createView();
            this.regionManager.addToRegion(RegionNames.blotterRegion, blotterModel.modelId);
        }
    }
}