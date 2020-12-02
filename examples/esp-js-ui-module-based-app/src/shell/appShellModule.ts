import {AppDefaultStateProvider, ShellModuleBase, StateService} from 'esp-js-ui';
import {Container} from 'esp-js-di';
import {DefaultStateProvider} from '../defaultStateProvider';

export class AppShellModule extends ShellModuleBase {

    constructor(container: Container, stateService: StateService) {
        super(container, stateService);
    }

    get appKey(): string {
        return 'esp-js-ui-module-based-app-state';
    }

    get stateSavingEnabled(): boolean {
        return true;
    }

    get stateSaveIntervalMs(): number {
        return 10_000;
    }

    getDefaultStateProvider(): AppDefaultStateProvider {
        return DefaultStateProvider;
    }
}