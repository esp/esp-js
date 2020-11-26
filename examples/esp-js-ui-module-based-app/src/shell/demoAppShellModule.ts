import {ShellModuleBase, StateService} from 'esp-js-ui';
import {Container} from 'esp-js-di';

export class DemoAppShellModule extends ShellModuleBase {

    constructor(container: Container, stateService: StateService) {
        super(container, stateService);
    }

    protected get appKey(): string {
        return 'esp-js-ui-module-based-app-state';
    }

    protected get stateSavingEnabled(): boolean {
        return true;
    }

    protected get stateSaveIntervalMs(): number {
        return 10_000;
    }
}