import esp from '../../';

class NumericalInput extends esp.model.ModelBase {
    constructor() {
        super();
        this._notional = 0;
    }
    get notional() {
        return this._notional;
    }
    set notional(value) {
        this.ensureLocked();
        this._notional = value;
    }
}

class Leg extends esp.model.ModelBase {
    constructor(number) {
        super();
        this._number = number;
        this._currencyPair = "";
        this._notionalField = new NumericalInput();
    }
    get number() {
        return this._number;
    }
    get currencyPair() {
        return this._currencyPair;
    }
    set currencyPair(value) {
        this.ensureLocked();
        this._currencyPair = value;
    }
    get notionalField() {
        return this._notionalField;
    }
}

class Tile extends esp.model.ModelRootBase {
    constructor() {
        super();
        this._leg1 = new Leg(1);
        this._leg2 = new Leg(2);
    }
    get leg1() {
        return this._leg1;
    }
    get leg2() {
        return this._leg2;
    }
}

describe('model', function() {

    var tile;

    beforeEach(() => {
        tile = new Tile();
    });

    function assertLockState(isLocked) {
        expect(tile.leg1.isLocked).toEqual(isLocked);
        expect(tile.leg1.isLocked).toEqual(isLocked);
        expect(tile.leg1.notionalField.isLocked).toEqual(isLocked);
        expect(tile.leg2.notionalField.isLocked).toEqual(isLocked);
    }

    it('should bind lock state on all children', () => {
        tile.bindLockPredicate();
        assertLockState(true);
        tile.unlock();
        assertLockState(false);
    });

    it('should throw if property set when locked', () => {
        tile.bindLockPredicate();
        tile.lock();
        expect(() => {
            tile.leg1.notionalField.notional = 4;
        }).toThrow(new Error("Model is locked, can't edit"));
        expect(() => {
            tile.leg1.currencyPair = "EURUSD";
        }).toThrow(new Error("Model is locked, can't edit"));
        expect(() => {
            tile.leg2.currencyPair = "EURUSD";
        }).toThrow(new Error("Model is locked, can't edit"));
    });
});