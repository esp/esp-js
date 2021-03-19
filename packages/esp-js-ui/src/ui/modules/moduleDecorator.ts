import {Guard} from 'esp-js';

export interface ModuleMetadata {
    moduleKey: string;
    moduleName: string;
    customMetadata?: any;
}

/**
 * Decorates an object as a module
 * @param moduleKey A unique key for the module
 * @param moduleName A friendly name
 * @param customMetadata Any custom metadata you wish to attached, typically used for entitlements or non esp data which may be required at module load time.
 */
export function espModule(moduleKey: string, moduleName: string, customMetadata?: any) {
    return function (target) {
        Guard.stringIsNotEmpty(moduleKey, 'moduleKey passed to an espModule decorator must not be \'\'');
        Guard.stringIsNotEmpty(moduleName, 'moduleKey passed to an espModule decorator must not be \'\'');
        EspModuleDecoratorUtils.setMetadataOnModuleClass(
            target,
            <ModuleMetadata>{
                moduleKey,
                moduleName: moduleName,
                customMetadata
            }
        );
    };
}

export namespace EspModuleDecoratorUtils {
    export function getMetadataFromModuleClass(moduleClass: any): ModuleMetadata {
        if (moduleClass.__espModuleMetadata) {
            return moduleClass.__espModuleMetadata;
        }
        throw new Error(`No esp module metadata found on '${moduleClass && moduleClass.name}'`);
    }

    export function setMetadataOnModuleClass(moduleClass: any, metadata: ModuleMetadata): void {
        moduleClass.__espModuleMetadata = metadata;
    }

    export function getCustomMetadataFromModuleClass(target: any): any {
        let moduleMetadata = getMetadataFromModuleClass(target);
        return moduleMetadata.customMetadata;
    }

    export function getMetadataFromModuleInstance(moduleInstance: any): any {
        let constructor = Object.getPrototypeOf(moduleInstance).constructor;
        if (constructor) {
            if (constructor.__espModuleMetadata) {
                return constructor.__espModuleMetadata;
            }
        }
        throw new Error(`No esp module metadata found on '${moduleInstance && moduleInstance.name}'`);
    }

    export function getCustomMetadataFromModuleInstance(target: any): any {
        let moduleMetadata = getMetadataFromModuleInstance(target);
        return moduleMetadata.customMetadata;
    }
}