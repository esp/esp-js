import {
    Logger
} from 'esp-js-ui';

const _log = Logger.create('CashTile-RootState');

export interface RootState {
    title: string;
}

export const defaultRootStateFactory = (): RootState => {
    return {
        title: 'Cash Tile',
    };
};

export class RootStateHandlers {

}