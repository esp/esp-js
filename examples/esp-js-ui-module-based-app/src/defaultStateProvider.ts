import {AppDefaultStateProvider, AppState, RegionState, RegionRecordState} from 'esp-js-ui';
import {TradingModuleContainerConst} from './trading-module/tradingModuleContainerConst';
import {RegionNames} from './shell/regionNames';
import {CashTilePersistedState} from './trading-module/views/cash-tile/persistedState/persistedStateModel';
import {BlotterModuleContainerConst} from './blotter-module/blotterModuleContainerConst';
import {BlotterState} from './blotter-module/views/blotter/model/blotterState';

export const DefaultStateProvider: AppDefaultStateProvider = {
    getDefaultAppState(): AppState {
        return {
            regionState: [
                {
                    regionName: RegionNames.workspaceRegion,
                    stateVersion: 1,
                    regionRecordStates: [
                        ...['EURUSD', 'EURGBP', 'AUDUSD', 'CADJPY'].map(symbol => ({
                            viewFactoryKey: TradingModuleContainerConst.cashTileViewFactory,
                            viewState: {currencyPair: symbol}
                        } as RegionRecordState<CashTilePersistedState> )),
                        {
                            viewFactoryKey: TradingModuleContainerConst.dynamicProductsViewFactory,
                            viewState: {}
                        } as RegionRecordState<{ }>
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