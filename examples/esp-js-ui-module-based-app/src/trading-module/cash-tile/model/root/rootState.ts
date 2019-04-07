import {PolimerHandlerMap} from 'esp-js-polimer';
import {RegionItem} from 'esp-js-ui';
import {
    Logger
} from 'esp-js-ui';
import {RegionNames} from '../../../../shell/regionNames';
import { RootEvents } from '../../events';
import {CashTileModel} from '../cashTileModel';

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

export const rootStateHandlerMap: PolimerHandlerMap<RootState, CashTileModel> = {
    [RootEvents.bootstrap]: (draft: RootState, ev: RootEvents.BootstrapEvent, model: CashTileModel) => {
        _log.info(`Adding to region ${RegionNames.workspaceRegion}`);
        draft.regionName = RegionNames.workspaceRegion;
        draft.regionItem = new RegionItem(model.modelId);
    }
};