/**
 * Provides a means to get initial state for a module.
 */
export interface ViewFactoryDefaultStateProvider<TViewState> {
    /**
     * Returns the default state for the modules ViewFactories
     */
    getDefaultViewState(): TViewState[];
}