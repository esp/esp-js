export type EspModelEntity = { espEntityId: string };
import {immerable} from 'immer';

export class ModelMapState<ModelMapEntity extends EspModelEntity> {
    // With this enabled immer will copy the private state fields when it drafts/copies instances of this class
    [immerable] = true;
    private _items = [];
    private _itemsLookup = new Map<string, ModelMapEntity>();
    private readonly _sortingComparator: (e1: ModelMapEntity, e2: ModelMapEntity) => number = null;

    constructor();
    constructor(sortingComparator: (e1: ModelMapEntity, e2: ModelMapEntity) => number);
    constructor(sortingComparator: (e1: ModelMapEntity, e2: ModelMapEntity) => number, itemsLookup: Map<string, ModelMapEntity>);
    constructor(...args: any[]) {
        if (args.length >= 1) {
            this._sortingComparator = args[0];
        }
        if (args.length >= 2) {
            this._itemsLookup = args[1];
        }
    }

    public getByKey(key: string): ModelMapEntity {
        return this._itemsLookup.get(key);
    }

    public deleteByKey(key: string) {
        this._update(m => m.delete(key));
    }

    public upsert(key: string, value: ModelMapEntity) {
        this._update(m => m.set(key, value));
    }

    public get items(): ModelMapEntity[] {
        return this._items;
    }

    public get itemsLookup() {
        return this._itemsLookup;
    }

    private _update(updater: (m: Map<string, ModelMapEntity>) => void) {
        const newMap = new Map(this._itemsLookup);
        updater(newMap);
        this._itemsLookup = newMap;
        let newArray = Array.from(this._itemsLookup.values());
        if (this._sortingComparator) {
            newArray.sort(this._sortingComparator);
        }
        this._items = newArray;
    }
}