import {EspDecoratorUtil, Guard, EspMetadata} from 'esp-js';

export const espModuleMetadataKey = 'esp-module-metadata';

export interface ModuleMetadata {
    moduleKey: string;
    moduleName: string;
    customMetadata?: any;
}

export function espModule(moduleKey: string, modeuleName: string, customMetadata?: any) {
    return function (target) {
        Guard.stringIsNotEmpty(moduleKey, 'moduleKey passed to an espModule decorator must not be \'\'');
        Guard.stringIsNotEmpty(modeuleName, 'moduleKey passed to an espModule decorator must not be \'\'');
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        let moduleMetadata = <ModuleMetadata>{
            moduleKey,
            moduleName: modeuleName,
            customMetadata
        };
        metadata.addCustomData(espModuleMetadataKey, moduleMetadata);
    };
}