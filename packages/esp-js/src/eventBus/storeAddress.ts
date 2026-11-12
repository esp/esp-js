import {Guard, utils} from '../system';

export interface StoreAddress {
    /**
     * The target store's ID.
     */
    storeId?: string;
    /**
     * An optional path which can be used at observation time to direct the event to a specific part of a store.
     * The ESP EventBus does not do any specific filtering on this, it simply adds it to the EventEnvelope dispatched to observers.
     * Observers can use it as they need.
     */
    entityKey?: string;
}

export class DefaultStoreAddress implements StoreAddress {
    private readonly _storeId: string;
    private readonly _entityKey: string = undefined;
    constructor(storeIdOrStoreAddress: string | StoreAddress);
    constructor(storeId: string, entityKey: string);
    constructor(...args: any[]) {
        if (args.length === 2) {
            this._storeId = args[0];
            this._entityKey = args[1];
            Guard.isString(this._storeId, `Invalid storeId provided, expected a string, received ${this._storeId}`);
            if (this._entityKey) {
                Guard.isString(this._entityKey, `Invalid entityKey provided, expected a string, received ${this._entityKey}`);
            }
        } else {
            const storeIdOrStoreAddress = args[0];
            Guard.isDefined(storeIdOrStoreAddress, `Invalid storeIdOrStoreAddress provided, value was null or undefined`);
            if (utils.isString(storeIdOrStoreAddress)) {
                this._storeId = storeIdOrStoreAddress;
            } else {
                Guard.isObject(storeIdOrStoreAddress, `Invalid storeIdOrStoreAddress provided, expected an object conforming to 'string | StoreAddress'`);
                this._storeId = storeIdOrStoreAddress.storeId;
                Guard.isString(this._storeId, `Invalid StoreAddress provided, expected storeId property to be defined, received ${this._storeId}`);
                if (storeIdOrStoreAddress.entityKey) {
                    this._entityKey = storeIdOrStoreAddress.entityKey;
                    Guard.isString(this._entityKey, `Invalid StoreAddress provided, expected entityKey property to be a string, received ${this._entityKey}`);
                }
            }
        }
    }
    public get storeId() {
        return this._storeId;
    }
    public get entityKey() {
        return this._entityKey;
    }
    public get hasEntityKey() {
        return !!this._entityKey;
    }
    public toString() {
        if (this.hasEntityKey) {
            return `storeId:${this._storeId},entityKey:${this._entityKey}`;
        }
        return `storeId:${this._storeId}`;
    }
}
