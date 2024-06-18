export type EspModelEntity = { espEntityId: string };

export class ModelMapState<ModelMapEntity extends EspModelEntity> {
    private _items = [];
    private _itemsLookup = new Map<string, ModelMapEntity>();
    private _sortingComparator: (e1: ModelMapEntity, e2: ModelMapEntity) => number = null;
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
    public deleteByKey(key: string): ModelMapState<ModelMapEntity> {
        this._update(m => m.delete(key));
        return this._mutate();
    }
    public upsert(key: string, value: ModelMapEntity): ModelMapState<ModelMapEntity> {
        this._update(m => m.set(key, value));
        return this._mutate();
    }
    public get items(): ModelMapEntity[] {
        return this._items;
    }
    private _update(updater: (m: Map<string, ModelMapEntity>) => void) {
        const newMap = new Map(this._itemsLookup);
        updater(newMap);
        this._itemsLookup = newMap;
        let newArray = Array.from(this._items.values());
        if (this._sortingComparator) {
            newArray.sort(this._sortingComparator);
        }
        this._items = newArray;
    }
    private _mutate() {
        return new ModelMapState(this._sortingComparator, this._itemsLookup);
    }
}