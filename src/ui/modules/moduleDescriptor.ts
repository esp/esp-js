import ModuleConstructor from './moduleConstructor';

interface ModuleDescriptor {
    factory: ModuleConstructor;
    moduleName: string;
    permissions?: Array<string>;
}

export default ModuleDescriptor;