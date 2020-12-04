import {AppDefaultStateProvider} from './appState';
import {Module} from './module';
import {Container} from 'esp-js-di';
import {StateService} from '../state';

export interface ShellModuleConstructor {
    new (container: Container, stateService: StateService): ShellModule;
}

/**
 * Represents the top level Application, or 'Shell', module.
 */
export interface ShellModule extends Module {
    /**
     * A unique key which will be used when saving state.
     */
    appStateKey: string;

    /**
     * If enabled, the ShellModule will save state of views in all regions every stateSaveIntervalMs
     */
    stateSavingEnabled: boolean;

    /**
     * The state save interval in milliseconds.
     */
    stateSaveIntervalMs: number;

    /**
     * Loads any views in default state.
     */
    loadViews();

    /**
     * Unloads all views
     */
    unloadViews();

    /**
     * Provided the initial state for a user.
     *
     * If persisted state is found, state returned by the AppDefaultStateProvider is ignored.
     */
    getDefaultStateProvider(): AppDefaultStateProvider;

    /**
     * Saves state for all components in any region.
     *
     * Note, if stateSavingEnabled is true this will get called automatically every stateSaveIntervalMs
     */
    saveAllComponentState();
}