import {ViewFactoryState} from './viewFactoryState';

export interface DefaultStateProvider {
    getViewFactoriesState(layoutMode:string):Array<ViewFactoryState>;
}