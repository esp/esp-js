export default class LayoutMode {
    private _name:string;

    static _desktop : LayoutMode = new LayoutMode('desktop');
    static _tabletDetached : LayoutMode = new LayoutMode('tabletDetached');
    static _tabledAttached : LayoutMode = new LayoutMode('tabledAttached');

    static get desktop() : LayoutMode {
        return LayoutMode._desktop;
    }
    
    static get tabletDetached() {
        return LayoutMode._tabletDetached;
    }
    
    static get tabletAttached() {
      return LayoutMode._tabledAttached;
    }
    
    static get values() : Array<LayoutMode> {
        return [LayoutMode.desktop, LayoutMode.tabletDetached, LayoutMode.tabletAttached];
    }

    constructor(status : string) {
        this._name = status;
    }

    get name() : string {
        return this._name;
    }
}
