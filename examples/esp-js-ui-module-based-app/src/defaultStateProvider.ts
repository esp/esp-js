import {AppDefaultStateProvider, AppState, RegionState, RegionRecordState} from 'esp-js-ui';
import {TradingModuleContainerConst} from './trading-module/tradingModuleContainerConst';
import {RegionNames} from './shell/regionNames';
import {CashTilePersistedState} from './trading-module/cash-tile/state/stateModel';
import {BlotterModuleContainerConst} from './blotter-module/blotterModuleContainerConst';
import {BlotterState} from './blotter-module/blotter/models/blotterState';

export const DefaultStateProvider: AppDefaultStateProvider = {
    getDefaultAppState(): AppState {
        return {
            regionState: [
                {
                    regionName: RegionNames.workspaceRegion,
                    stateVersion: 1,
                    regionRecordStates: [
                        ...['EURUSD', 'EURGBP', 'AUDUSD', 'CADJPY', 'EURCAD', 'USDBRL'].map(symbol => ({
                            viewFactoryKey: TradingModuleContainerConst.cashTileViewFactory,
                            viewState: {currencyPair: symbol}
                        } as RegionRecordState<CashTilePersistedState> ))
                    ]
                } as RegionState,
                {
                    regionName: RegionNames.blotterRegion,
                    stateVersion: 1,
                    regionRecordStates: [
                        {
                            viewFactoryKey: BlotterModuleContainerConst.blotterViewFactory,
                            viewState: {
                                idSortType: 'Ascending'
                            }
                        } as RegionRecordState<BlotterState>
                    ]
                } as RegionState
            ]
        };
    }
};