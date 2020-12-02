import {AppDefaultStateProvider, AppState, RegionState, ViewState} from 'esp-js-ui';
import {TradingModuleContainerConst} from './trading-module/tradingModuleContainerConst';
import {RegionNames} from './shell/regionNames';
import {CashTilePersistedState} from './trading-module/cash-tile/state/stateModel';
import {BlotterState} from './trading-module/blotter/models/blotterState';

export const DefaultStateProvider: AppDefaultStateProvider = {
    getDefaultAppState(): AppState {
        return {
            regionState: [
                {
                    regionName: RegionNames.workspaceRegion,
                    stateVersion: 1,
                    viewState: [
                        ...['EURUSD', 'EURGBP', 'AUDUSD', 'CADJPY'].map(symbol => ({
                            viewFactoryKey: TradingModuleContainerConst.cashTileViewFactory,
                            state: {currencyPair: symbol}
                        } as ViewState<CashTilePersistedState> ))
                    ]
                } as RegionState,
                {
                    regionName: RegionNames.blotterRegion,
                    stateVersion: 1,
                    viewState: [
                        {
                            viewFactoryKey: TradingModuleContainerConst.blotterViewFactory,
                            state: { }
                        } as ViewState<BlotterState>
                    ]
                } as RegionState
            ]
        };
    }
};