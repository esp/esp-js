import ModuleConstructor from './moduleConstructor';
interface ModuleDescriptor {
    factory: ModuleConstructor;
    moduleName: string;
}

export default ModuleDescriptor;