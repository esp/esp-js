export interface ModuleLoadChange {
    type: 'loadChange';
    moduleName: string;
    description: string;
}

export interface ModuleLoadErrorChange {
    type: 'loadError';
    moduleName: string;
    errorMessage: string;
}

export type ModuleLoadResult = ModuleLoadChange | ModuleLoadErrorChange;