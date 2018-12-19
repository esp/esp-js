export interface StateHandlerModel<TState> {
    getState(): TState;
}