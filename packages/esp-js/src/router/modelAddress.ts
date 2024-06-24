import {utils} from '../system';

export interface ModelAddress {
    modelId: string;
    modelPath: string;
}

export class DefaultEventAddress implements ModelAddress {
    private readonly _modelId: string;
    private readonly _modelPath: string = null;
    constructor(modelIdOrEventAddress: string | ModelAddress) {
        if (utils.isEventAddress(modelIdOrEventAddress)) {
            this._modelId = modelIdOrEventAddress.modelId;
            this._modelPath = modelIdOrEventAddress.modelPath;
        } else {
            this._modelId = modelIdOrEventAddress;
        }
    }
    public get modelId() {
        return this._modelId;
    }
    public get modelPath() {
        return this._modelPath;
    }
    public hasModelPath() {
        return !!this._modelPath;
    }
    public toString() {
        if (this.hasModelPath()) {
            return `modelId:${this._modelId},modelPath:${this._modelPath}`;
        }
        return `modelId:${this._modelId}`;
    }
}