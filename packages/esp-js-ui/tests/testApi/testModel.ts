import {ShellModuleBase} from '../../src/ui/modules';

export class TestShellModule extends ShellModuleBase {
    get appStateKey(): string {
        return 'test-app';
    }
}