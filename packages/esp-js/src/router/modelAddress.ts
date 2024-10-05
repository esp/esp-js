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

const invalidModelIdOrAddressError: string = 'Can not correctly construct an address to dispatch event. You must publish with a string modelId or valid ModelAddress shape';

export class DefaultModelAddress implements ModelAddress {
    private readonly _modelId: string;
    private readonly _entityKey: string = undefined;
    constructor(modelIdOrModelAddress: string | ModelAddress);
    constructor(modelId: string, entityKey: string);
    constructor(...args: any[]) {
        if (args.length === 2) {
            this._modelId = args[0];
            this._entityKey = args[1];
        } else {
            const modelIdOrModelAddress = args[0];
            if (utils.isString(modelIdOrModelAddress)) {
                this._modelId = modelIdOrModelAddress;
            } else {
                if (modelIdOrModelAddress.modelId) {
                    this._modelId = modelIdOrModelAddress.modelId;
                }
                if (modelIdOrModelAddress.entityKey) {
                    this._entityKey = modelIdOrModelAddress.entityKey;
                }
            }
        }
        Guard.isString(this._modelId, invalidModelIdOrAddressError);
        if (this._entityKey) {
            Guard.isString(this._entityKey, invalidModelIdOrAddressError);
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