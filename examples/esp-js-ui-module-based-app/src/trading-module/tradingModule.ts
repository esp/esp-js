import * as uuid from 'uuid';
import * as Rx from 'rx';
import {Container, EspDiConsts} from 'esp-js-di';
import {
    ModuleBase,
    SystemContainerConst,
    ViewFactoryBase,
    PrerequisiteRegister,
    Logger,
    espModule
} from 'esp-js-ui';
import {TradingModuleContainerConst} from './tradingModuleContainerConst';
import {CashTileViewFactory} from './cash-tile/cashTileViewFactory';
import {BlotterViewFactory} from './blotter/blotterViewFactory';
import {BlotterModel} from './blotter/models/blotterModel';
import {TradingModuleDefaultStateProvider} from './tradingModuleDefaultStateProvider';

let _log = Logger.create('TradingModule');

@espModule('trading-module', 'Trading Module')
export class TradingModule extends ModuleBase {
    _viewFactoryGroupId: string;
    _tradingModuleDefaultStateProvider = new TradingModuleDefaultStateProvider();

    constructor(container: Container) {
        super(container);
        this._viewFactoryGroupId = uuid.v4();
    }

    public getDefaultStateProvider() {
        return this._tradingModuleDefaultStateProvider;
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

    getViewFactories(): Array<ViewFactoryBase<any>> {
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
}