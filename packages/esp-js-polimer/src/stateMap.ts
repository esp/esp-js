import {immerable} from 'immer';
import {utils} from 'esp-js';

export class StateMap<StateMapEntity> {
    public static isStateMap = <T>(value: any): value is StateMap<T> => {
        return typeof value === 'object' && (value as StateMap<T>)._itemsLookup !== undefined && (value as StateMap<T>)._items !== undefined;
    };

    // With this enabled immer will copy the private state fields when it drafts/copies instances of this class
    [immerable] = true;
    private _items = [];
    private _itemsLookup = new Map<string, StateMapEntity>();
    private readonly _sortingComparator: (e1: StateMapEntity, e2: StateMapEntity) => number = null;

    constructor();
    constructor(sortingComparator: (e1: StateMapEntity, e2: StateMapEntity) => number);
    constructor(initialState: Map<string, StateMapEntity>);
    constructor(initialState: Map<string, StateMapEntity>, sortingComparator: (e1: StateMapEntity, e2: StateMapEntity) => number);
    constructor(...args: any[]) {
        if (args.length === 1) {
            if (utils.isFunction(args[0])) {
                this._sortingComparator = args[0];
            } else {
                this._itemsLookup = args[0];
            }
        } else if (args.length === 2) {
            this._itemsLookup = args[0];
            this._sortingComparator = args[1];
        }
    }

    public getByPath(modelPath: string): StateMapEntity {
        return this._itemsLookup.get(modelPath);
    }

    public deleteByPath(modelPath: string) {
        this._update(m => m.delete(modelPath));
    }

    public upsert(modelPath: string, value: StateMapEntity) {
        this._update(m => m.set(modelPath, value));
    }

    public get items(): StateMapEntity[] {
        return this._items;
    }

    public get itemsLookup() {
        return this._itemsLookup;
    }

    private _update(updater: (m: Map<string, StateMapEntity>) => void) {
        const newMap = new Map(this._itemsLookup);
        updater(newMap);
        this._itemsLookup = newMap;
        let newArray = Array.from(this._itemsLookup.values());
        if (this._sortingComparator) {
            newArray.sort(this._sortingComparator);
        }
        this._items = newArray;
    }

    // this class works with immer, so rather than make every state change API return `this` I'm adding a `clone()` for the explicit non-immer cases it's required.
    public clone() {
        return new StateMap(this._itemsLookup, this._sortingComparator);
    }
}