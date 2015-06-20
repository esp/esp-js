class AccountsField {
    constructor() {
        this._value = [];
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
}

export default AccountsField;