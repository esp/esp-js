/**
 * An interface given to a ViewFactory when restoring a view from persisted state
 */
export interface PersistedViewState<TViewState> {
    /**
     * Provides a version for the regions state.
     * You can set this to 1 until you need to change.
     * At some future point, you may modify the regions state model and need to migrate state from an older version to a newer one.
     * You'd typically do this by overriding the call to `region.getRegionState(regionState)`
     */
    stateVersion: number;
    state: TViewState;
}

/**
 * An internal interfaces used by the state functionality which adds some additional metadata so a view can be tied to it's ViewFactory
 */
export interface ViewState<TState> extends PersistedViewState<TState> {
    viewFactoryKey: string;
}