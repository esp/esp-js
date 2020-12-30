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
    /**
     * The regions id associated with this piece of state.
     * This ID is ultimately the same id as RegionItemRecord.id
     *
     * If it's not provided it will be defaulted
     */
    regionRecordId?: string;
    /**
     * The state for the view
     */
    state: TViewState;
}

/**
 * An internal interfaces used by the state functionality which adds some additional metadata so a view can be tied to it's ViewFactory
 */
export interface ViewState<TState extends object> extends PersistedViewState<TState> {
    viewFactoryKey: string;
}