import {ModuleConstructor} from './moduleConstructor';

export interface ModuleDescriptor {
    factory: ModuleConstructor;
    moduleName: string;
    permissions?: Array<string>;
}
