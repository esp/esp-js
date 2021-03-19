import {Shell} from '../../src/ui/modules';

export class TestShellModule extends Shell {
    get appStateKey(): string {
        return 'test-app';
    }
}