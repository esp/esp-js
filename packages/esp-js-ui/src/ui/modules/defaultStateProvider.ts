export interface ViewFactoryDefaultState {
    viewFactoryKey: string;
    stateVersion?: number;
    state: Array<any>;
}

export interface DefaultStateProvider {
    // Note: layoutMode has been deprecated and will be removed in a future release.
    // It's been marked as optional for backwards compatibility
    getViewFactoriesState(layoutMode?:string): ViewFactoryDefaultState[];
}