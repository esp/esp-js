import * as uuid from 'uuid';
import * as Rx from 'rx';
import {Container, MicroDiConsts} from 'microdi-js';
import {
    ModuleBase,
    StateService,
    ComponentFactoryBase,
    SystemContainerConst,
    PrerequisiteRegistrar,
    Logger
} from 'esp-js-ui';
import {TradingModuleContainerConst} from './tradingModuleContainerConst';
import {CashTileComponentFactory} from './cash-tile/cashTileComponentFactory';
import {BlotterComponentFactory} from './blotter/blotterComponentFactory';
import {BlotterModel} from './blotter/models/blotterModel';
import {TradingModuleDefaultStateProvider} from './tradingModuleDefaultStateProvider';

let _log = Logger.create('TradingModule');

export class TradingModule extends ModuleBase {
    _componentFactoryGroupId: string;

    constructor(container: Container, stateService: StateService) {
        super(
            'trading-module',
            container,
            stateService,
            new TradingModuleDefaultStateProvider()
        );
        this._componentFactoryGroupId = uuid.v4();
    }

    static get requiredPermission(): string {
        return 'fx-trading';
    }

    get moduleName() {
        return 'Trading Module';
    }

    initialise() {

    }

    configureContainer() {
        _log.group('Configuring container');
        _log.debug(`Registering ${TradingModuleContainerConst.cashTileComponentFactory}`);
        this.container
            .register(TradingModuleContainerConst.cashTileComponentFactory, CashTileComponentFactory)
            .inject(MicroDiConsts.owningContainer, SystemContainerConst.router)
            .singleton()
            .inGroup(this._componentFactoryGroupId);
        _log.debug(`Registering ${TradingModuleContainerConst.blotterComponentFactory}`);
        this.container
            .register(TradingModuleContainerConst.blotterComponentFactory, BlotterComponentFactory)
            .inject(MicroDiConsts.owningContainer, SystemContainerConst.router)
            .singleton()
            .inGroup(this._componentFactoryGroupId);
        _log.debug(`Registering ${TradingModuleContainerConst.blotterModel}`);
        this.container
            .register(TradingModuleContainerConst.blotterModel, BlotterModel)
            .inject(SystemContainerConst.router, SystemContainerConst.region_manager)
            .singletonPerContainer();
        _log.groupEnd();
    }

    getComponentsFactories(): Array<ComponentFactoryBase<any>> {
        return this.container.resolveGroup(this._componentFactoryGroupId);
    }

    registerPrerequisites(registrar: PrerequisiteRegistrar): void {
        _log.groupCollapsed('Registering  Prerequisites');
        _log.debug(`Registering 1`);
        registrar.registerStream(
            Rx.Observable.timer(2000).take(1).concat(Rx.Observable.throw(new Error('Load error'))),
            'Loading Module That Fails'
        );
        _log.debug(`Registering 2`);
        registrar.registerStream(Rx.Observable.timer(2000).take(1), 'Loading Referential Data');
        _log.groupEnd();
    }
}