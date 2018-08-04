import * as _ from 'lodash';
import {DefaultStateProvider, ComponentFactoryState} from 'esp-js-ui';
import {RegionNames} from '../shell/regionNames';
import {CashTileState} from './cash-tile/models/cashTileState';
import {BlotterState} from './blotter/models/blotterState';
import {TradingModuleContainerConst} from './tradingModuleContainerConst';

export class TradingModuleDefaultStateProvider implements DefaultStateProvider {
    getComponentFactoriesState(layoutMode: string): Array<ComponentFactoryState> {
        let blotterStates = [BlotterState.create(RegionNames.blotterRegion)];
        let cashTileStates: Array<CashTileState> = _.map(
            ['EURUSD', 'EURGBP', 'AUDUSD', 'CADJPY', 'CHFJPY', 'GBPJPY'],
            symbol => CashTileState.create(symbol, RegionNames.workspaceRegion)
        );
        return [{
            componentFactoryKey: TradingModuleContainerConst.blotterComponentFactory,
            componentsState: blotterStates
        }, {
            componentFactoryKey: TradingModuleContainerConst.cashTileComponentFactory,
            componentsState: cashTileStates
        }];
    }
}
