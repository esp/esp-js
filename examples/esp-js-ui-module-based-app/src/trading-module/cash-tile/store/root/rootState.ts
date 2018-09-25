import {PolimerHandlerMap} from 'esp-js-polimer';
import {RegionItem} from 'esp-js-ui';
import {
    Logger
} from 'esp-js-ui';
import {RegionNames} from '../../../../shell/regionNames';
import { RootEvents } from '../../events';
import {CashTileStore} from '../cashTileStore';

const _log = Logger.create('CashTile-RootState');

export interface RootState {
    title: string;
    regionName: string;
    regionItem?: RegionItem;
}

export const defaultRootStateFactory = (): RootState => {
    return {
        title: 'Cash Tile',
        regionName: RegionNames.workspaceRegion
    };
};

export const rootStateHandlerMap: PolimerHandlerMap<RootState, CashTileStore> = {
    [RootEvents.bootstrap]: (draft: RootState, ev: RootEvents.BootstrapEvent, store: CashTileStore) => {
        _log.info(`Adding to region ${RegionNames.workspaceRegion}`);
        draft.regionName = RegionNames.workspaceRegion;
        draft.regionItem = new RegionItem(store.modelId);
    }
};