import {AppDefaultStateProvider, ShellModuleBase, StateService} from 'esp-js-ui';
import {Container} from 'esp-js-di';
import {DefaultStateProvider} from '../defaultStateProvider';

export class AppShellModule extends ShellModuleBase {

    public static readonly APP_STATE_KEY = 'esp-js-ui-module-based-app-state';

    constructor(container: Container, stateService: StateService) {
        super(container, stateService);
    }

    get appStateKey(): string {
        return AppShellModule.APP_STATE_KEY;
    }

    get stateSavingEnabled(): boolean {
        return true;
    }

    get stateSaveIntervalMs(): number {
        return 5_000; // for the demo make this frequent
    }

    getDefaultStateProvider(): AppDefaultStateProvider {
        return DefaultStateProvider;
    }
}