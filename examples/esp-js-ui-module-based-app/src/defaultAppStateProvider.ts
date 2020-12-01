import {AppDefaultStateProvider, AppState, RegionState, ViewState} from 'esp-js-ui';
import {TradingModuleContainerConst} from './trading-module/tradingModuleContainerConst';
import {CashTileStateUtils} from './trading-module/cash-tile/model/cashTileModel';
import * as uuid from 'uuid';
import {RegionNames} from './shell/regionNames';
import {BlotterState} from './trading-module/blotter/models/blotterState';
import {CashTileState} from './trading-module/cash-tile/state/stateModel';
import {PersistedViewState} from 'esp-js-ui/src';

export const DemoAppDefaultStateProvider: AppDefaultStateProvider = {
    getDefaultAppState(): AppState {
        return {
            regionState: [
                {
                    regionName: RegionNames.workspaceRegion,
                    viewState: [
                        {
                            viewFactoryKey: TradingModuleContainerConst.cashTileViewFactory,
                            state: ['EURUSD', 'EURGBP', 'AUDUSD', 'CADJPY'].map(
                                symbol => ({currencyPair: symbol} as PersistedViewState<CashTileState>)
                            )
                        }
                    ] as ViewState[]
                } as RegionState,
                {
                    regionName: RegionNames.blotterRegion,
                    viewState: [
                        {
                            viewFactoryKey: TradingModuleContainerConst.blotterViewFactory,
                            state: [BlotterState.create(RegionNames.blotterRegion)]
                        }
                    ] as ViewState[]
                } as RegionState
            ]
        };
    }
};