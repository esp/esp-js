import * as uuid from 'uuid';
import * as _ from 'lodash';
import {DefaultStateProvider, ComponentFactoryState} from 'esp-js-ui';
import {RegionNames} from '../shell/regionNames';
import {BlotterState} from './blotter/models/blotterState';
import {TradingModuleContainerConst} from './tradingModuleContainerConst';
import {CashTileStore, defaultStoreFactory} from './cash-tile/store/cashTileStore';

export class TradingModuleDefaultStateProvider implements DefaultStateProvider {
    getComponentFactoriesState(layoutMode: string): Array<ComponentFactoryState> {
        let blotterStates = [BlotterState.create(RegionNames.blotterRegion)];
        let cashTileStores: Array<CashTileStore> = _.map(
            ['EURUSD', 'EURGBP', 'AUDUSD', 'CADJPY'],
            symbol => defaultStoreFactory(uuid.v4(), symbol)
        );
        return [{
            componentFactoryKey: TradingModuleContainerConst.blotterComponentFactory,
            componentsState: blotterStates
        }, {
            componentFactoryKey: TradingModuleContainerConst.cashTileComponentFactory,
            componentsState: cashTileStores
        }];
    }
}
