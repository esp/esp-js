import { Container } from 'esp-js-di';
import { ModuleBase, StateService, ComponentFactoryBase, PrerequisiteRegistrar } from 'esp-js-ui';
export declare class TradingModule extends ModuleBase {
    _componentFactoryGroupId: string;
    constructor(container: Container, stateService: StateService);
    static readonly requiredPermission: string;
    readonly moduleName: string;
    initialise(): void;
    configureContainer(): void;
    getComponentsFactories(): Array<ComponentFactoryBase<any>>;
    registerPrerequisites(registrar: PrerequisiteRegistrar): void;
}
