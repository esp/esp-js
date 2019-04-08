import { PolimerHandlerMap } from 'esp-js-polimer';
import { RegionItem } from 'esp-js-ui';
import { CashTileModel } from '../cashTileModel';
export interface RootState {
    title: string;
    regionName: string;
    regionItem?: RegionItem;
}
export declare const defaultRootStateFactory: () => RootState;
export declare const rootStateHandlerMap: PolimerHandlerMap<RootState, CashTileModel>;
