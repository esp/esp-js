import * as uuid from 'uuid';
import * as Rx from 'rx';
import { Container, MicroDiConsts } from 'microdi-js';
import { ModuleBase, StateService, ComponentFactoryBase, SystemContainerConst, PrerequisiteRegistrar } from 'esp-js-ui';
import TradingModuleDefautStateProvider from './tradingModuleDefaultStateProvider';
import TradingModuleContainerConst from './tradingModuleContainerConst';
import CashTileComponentFactory from './cash-tile/cashTileComponentFactory';
import CashTileModel from './cash-tile/models/cashTileModel';
import BlotterComponentFactory from './blotter/blotterComponentFactory';
import BlotterModel from './blotter/models/blotterModel';

export default class TradingModule extends ModuleBase {
    _componentFactoryGroupId:string;

    constructor(container:Container, stateService:StateService) {
        super(
            'trading-module',
            container,
            stateService,
            new TradingModuleDefautStateProvider()
        );
        this._componentFactoryGroupId = uuid.v4();
    }

    static get requiredPermission():string {
        return 'fx-trading';
    }

    initialise() {

    }

    configureContainer() {
        this.container
            .register(TradingModuleContainerConst.cashTileComponentFactory, CashTileComponentFactory)
            .inject(MicroDiConsts.owningContainer, SystemContainerConst.router)
            .singleton()
            .inGroup(this._componentFactoryGroupId);
        this.container
            .register(TradingModuleContainerConst.cashTileModel, CashTileModel)
            .inject(SystemContainerConst.router, SystemContainerConst.region_manager)
            .singletonPerContainer();
        this.container
            .register(TradingModuleContainerConst.blotterComponentFactory, BlotterComponentFactory)
            .inject(MicroDiConsts.owningContainer, SystemContainerConst.router)
            .singleton()
            .inGroup(this._componentFactoryGroupId);
        this.container
            .register(TradingModuleContainerConst.blotterModel, BlotterModel)
            .inject(SystemContainerConst.router, SystemContainerConst.region_manager)
            .singletonPerContainer();
    }

    getComponentsFactories():Array<ComponentFactoryBase> {
        return this.container.resolveGroup(this._componentFactoryGroupId);
    }

    registerPrerequisites(registrar: PrerequisiteRegistrar): void {
        registrar.registerStream(Rx.Observable.timer(2000).take(1).concat(Rx.Observable.throw(new Error('Load error'))), 'Loading Module That Fails', e => `Custom message: ${e.message}`);
        registrar.registerStream(Rx.Observable.timer(2000).take(1), 'Loading Referential Data');
    }
}