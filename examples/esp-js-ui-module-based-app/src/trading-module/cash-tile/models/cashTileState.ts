import {RegionNames} from '../../../shell/regionNames';
export class CashTileState {
    public symbol: string;
    public regionName: string;

    static createNew() : CashTileState {
        let state = new CashTileState();
        state.symbol = 'EURUSD';
        state.regionName = RegionNames.workspaceRegion;
        return state;
    }

    static create(symbol:string, regionName:string) : CashTileState {
        let state = new CashTileState();
        state.symbol = symbol;        
        state.regionName = regionName;
        return state;
    }
}
