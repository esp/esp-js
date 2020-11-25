import {ViewFactoryState} from './viewFactoryState';

export type ApplicationState = {
    [viewFactoryId: string]: ViewFactoryState;
};