import {
    Logger
} from 'esp-js-ui';

export interface RootState {
    title: string;
}

export const defaultRootStateFactory = (): RootState => {
    return {
        title: 'Cash Tile',
    };
};