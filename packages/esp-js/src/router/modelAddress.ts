import {Guard, utils} from '../system';

export interface ModelAddress {
    /**
     * The target model's ID.
     */
    modelId?: string;
    /**
     * An optional path which can be used at observation time to direct the event to a specific part of a model.
     * The ESP Router does not do any specific filtering on this, it simply adds it to the EventEnvelope dispatched to observers.
     * Observers can use it as they need.
     */
    entityKey?: string;
}

export class DefaultModelAddress implements ModelAddress {
    private readonly _modelId: string;
    private readonly _entityKey: string = undefined;
    constructor(modelIdOrModelAddress: string | ModelAddress);
    constructor(modelId: string, entityKey: string);
    constructor(...args: any[]) {
        if (args.length === 2) {
            this._modelId = args[0];
            this._entityKey = args[1];
            Guard.isString(this._modelId, `Invalid modelId provided, expected a string, received ${this._modelId}`);
            if (this._entityKey) {
                Guard.isString(this._entityKey, `Invalid entityKey provided, expected a string, received ${this._entityKey}`);
            }
        } else {
            const modelIdOrModelAddress = args[0];
            Guard.isDefined(modelIdOrModelAddress, `Invalid modelIdOrModelAddress provided, value was null or undefined`);
            if (utils.isString(modelIdOrModelAddress)) {
                this._modelId = modelIdOrModelAddress;
            } else {
                Guard.isObject(modelIdOrModelAddress, `Invalid modelIdOrModelAddress provided, expected an object conforming to 'string | ModelAddress'`);
                this._modelId = modelIdOrModelAddress.modelId;
                Guard.isString(this._modelId, `Invalid ModelAddress provided, expected modelId property to be defined, received ${this._modelId}`);
                if (modelIdOrModelAddress.entityKey) {
                    this._entityKey = modelIdOrModelAddress.entityKey;
                    Guard.isString(this._entityKey, `Invalid ModelAddress provided, expected entityKey property to be a string, received ${this._entityKey}`);
                }
            }
        }
    }
    public get modelId() {
        return this._modelId;
    }
    public get entityKey() {
        return this._entityKey;
    }
    public get hasEntityKey() {
        return !!this._entityKey;
    }
    public toString() {
        if (this.hasEntityKey) {
            return `modelId:${this._modelId},entityKey:${this._entityKey}`;
        }
        return `modelId:${this._modelId}`;
    }
}