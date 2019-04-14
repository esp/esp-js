export declare const espModuleMetadataKey = "esp-module-metadata";
export interface ModuleMetadata {
    moduleKey: string;
    moduleName: string;
    customMetadata?: any;
}
export declare function espModule(moduleKey: string, modeuleName: string, customMetadata?: any): (target: any, name: any, descriptor: any) => any;
