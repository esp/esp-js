export namespace TradingPreferencesEvents {
    export interface DefaultPairChangedEvent {
        pair: string;
    }
    export const defaultPairChanged = 'defaultPairChanged';
}
