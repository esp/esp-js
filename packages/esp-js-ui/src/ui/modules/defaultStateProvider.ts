import {ViewFactoryState} from './viewFactoryState';

export interface DefaultStateProvider {
    // Note: layoutMode has been deprecated and will be removed in a future release.
    // It's been marked as optional for backwards compatibility
    getViewFactoriesState(layoutMode?:string):Array<ViewFactoryState>;
}