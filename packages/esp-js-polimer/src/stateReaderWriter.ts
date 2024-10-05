import {produce} from 'immer';

export interface StateReaderWriter {
    getState(entityKey: string): any;

    setState(entityKey: string, s: any);
}

/**
 * DirectStateReaderWriter works directly with an Map type state.
 * The entire Map will be returned.
 */
export class DirectStateReaderWriter implements StateReaderWriter {
    constructor(private _modelGetter: () => object, private _stateName: string) {
    }

    getState(entityKey: string): any {
        return this._modelGetter()[this._stateName];
    }

    setState(entityKey: string, state: any) {
        this._modelGetter()[this._stateName] = state;
    }
}

/**
 * MapReaderWriter works with a specific entity in a Map.
 */
export class MapReaderWriter implements StateReaderWriter {
    constructor(private _modelGetter: () => object, private _stateName: string) {
    }

    getState(entityKey: string): any {
        return this._getLatestMapState().get(entityKey);
    }

    setState(entityKey: string, state: any) {
        // Code elsewhere handles mutating the specific entity through immer.
        // At this point, we assume that's been done, we now re-insert the change into the Map via immer.
        // I.e., using immer to update the Map.
        this._modelGetter()[this._stateName] = produce<Map<string, any>>(
            this._getLatestMapState(),
            draft => {
                draft.set(entityKey, state);
            }
        );
    }

    _getLatestMapState(): Map<string, any> {
        return this._modelGetter()[this._stateName] as Map<string, any>;
    }
}