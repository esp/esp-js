import ComponentFactoryBase from './componentFactoryBase';

interface FactoryEntry {
    componentFactoryKey: string;
    factory: ComponentFactoryBase;
    shortName: string;
    isWorkspaceItem: boolean;
}

export default FactoryEntry;
