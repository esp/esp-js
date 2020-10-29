import {PrerequisiteRegister, ShellModule, ViewRegistryModel} from 'esp-js-ui';

export class DemoAppShellModule extends ShellModule {
    protected get stateKey(): string {
        return 'esp-js-ui-module-based-app-state';
    }
}