import * as uuid from 'uuid';
import {Container, EspDiConsts} from 'esp-js-di';
import {
    ModuleBase,
    SystemContainerConst,
    ViewFactoryBase,
    PrerequisiteRegister,
    Logger,
    ModelBase,
    espModule,
} from 'esp-js-ui';
import {TradingModuleContainerConst} from './tradingModuleContainerConst';
import {CashTileViewFactory} from './cash-tile/cashTileViewFactory';
import {CurrencyPairRefDataService} from './cash-tile/services/currencyPairRefDataService';

let _log = Logger.create('TradingModule');

@espModule('trading-module', 'Trading Module')
export class TradingModule extends ModuleBase {
    _viewFactoryGroupId: string = uuid.v4();

    constructor(container: Container) {
        super(container);
    }

    configureContainer() {
        _log.debug(`Registering module components`);

        // Services
        this.container
            .register(TradingModuleContainerConst.ccyPairRefDataService, CurrencyPairRefDataService)
            .singleton();

        // Cash Tile
        this.container
            .register(TradingModuleContainerConst.cashTileViewFactory, CashTileViewFactory)
            .inject(EspDiConsts.owningContainer, SystemContainerConst.router)
            .singleton()
            .inGroup(this._viewFactoryGroupId);
    }

    getViewFactories(): Array<ViewFactoryBase<ModelBase, any>> {
        return this.container.resolveGroup(this._viewFactoryGroupId);
    }

    registerPrerequisites(register: PrerequisiteRegister): void {
        const ccyPairRefDataService = this.container.resolve<CurrencyPairRefDataService>(TradingModuleContainerConst.ccyPairRefDataService);
        register.registerStream(ccyPairRefDataService.loadCurrencyPairs(), 'Loading Currency Pairs');
    }

    public get supportsNewStateApi(): boolean {
        return true;
    }
}