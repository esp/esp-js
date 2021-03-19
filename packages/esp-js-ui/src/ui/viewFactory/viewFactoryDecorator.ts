import {Guard} from 'esp-js';

export function getViewFactoryMetadata(target): ViewFactoryMetadata {
    let constructorFunction = target.constructor;
    if (constructorFunction.__viewFactoryMetadata) {
        return constructorFunction.__viewFactoryMetadata;
    }
    throw new Error(`No view factory metadata found on '${target && target.name}'`);
}

// TODO tests
export function viewFactory(viewKey: string, shortName: string);
export function viewFactory(viewKey: string, shortName: string, customMetadata?: object);
export function viewFactory(viewKey: string, shortName: string, stateVersion: number, customMetadata?: object);
export function viewFactory(...args: any[]) {
    let viewKey: string = args[0], shortName: string = args[1], stateVersion: number = 1, customMetadata: any = null;
    if (args.length > 2) {
        if (isNaN(args[2])) {
            customMetadata = args[2];
        } else {
            stateVersion = args[2];
        }
        if (args.length === 4) {
            customMetadata = args[3];
        }
    }
    return (target) => {
        target.__viewFactoryMetadata = new ViewFactoryMetadata(viewKey, shortName, stateVersion, customMetadata);
    };
}

export class ViewFactoryMetadata {
    constructor(public readonly viewKey: string, public readonly shortName: string, public readonly stateVersion: number, public readonly customMetadata?: any) {
        Guard.isString(viewKey, 'viewKey must be defined and be a string');
        Guard.isString(shortName, 'shortName must be defined and be a string');
        Guard.isNumber(stateVersion, 'stateVersion must be defined and be a string');
    }
}

export function getViewFactoryMetadataFromModelInstance(model: any): ViewFactoryMetadata {
    if (model.__viewFactoryMetadata) {
        return model.__viewFactoryMetadata;
    }
    throw new Error(`No view factory metadata found on model`);
}

export function setViewFactoryMetadataOnModelInstance(model: any, metadata: ViewFactoryMetadata): void {
    model.__viewFactoryMetadata = metadata;
}
