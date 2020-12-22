import {AppDefaultStateProvider, AppState, RegionState, ViewState} from 'esp-js-ui';
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
                    viewState: [
                        ...['EURUSD', 'EURGBP', 'AUDUSD', 'CADJPY', 'EURCAD', 'USDBRL'].map(symbol => ({
                            viewFactoryKey: TradingModuleContainerConst.cashTileViewFactory,
                            state: {currencyPair: symbol}
                        } as ViewState<CashTilePersistedState> ))
                    ]
                } as RegionState<ViewState<CashTilePersistedState>>,
                {
                    regionName: RegionNames.blotterRegion,
                    stateVersion: 1,
                    viewState: [
                        {
                            viewFactoryKey: BlotterModuleContainerConst.blotterViewFactory,
                            state: {
                                idSortType: 'Ascending'
                            }
                        } as ViewState<BlotterState>
                    ]
                } as RegionState<ViewState<BlotterState>>
            ]
        };
    }
};