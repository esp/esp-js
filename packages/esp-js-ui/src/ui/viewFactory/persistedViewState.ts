export interface PersistedViewState<TViewState> {
    stateVersion: number;
    state: TViewState;
}