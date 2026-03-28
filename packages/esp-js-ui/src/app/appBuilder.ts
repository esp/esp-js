import {Guard, Logger} from 'esp-js';
import {ModuleOrFactory} from '../modules/types';
import {App} from './types';
import {DefaultApp} from './defaultApp';
import {Container} from 'esp-js-di';

const _log = Logger.create('AppBuilder');

export interface AppBuilderState {
    appName: string;
    moduleEntries: ModuleOrFactory[];
    configureContainerFns: Array<(container: Container) => void>;
    initialiseFns: Array<(app?: App) => Promise<void>>;
    startFns: Array<(app?: App) => Promise<void>>;
}

export class AppBuilder {
    private _state: AppBuilderState;
    private _built: boolean = false;

    private constructor(appName: string) {
        this._state = {
            appName,
            configureContainerFns: [],
            moduleEntries: [],
            initialiseFns: [],
            startFns: [],
        };
    }

    static create(appName: string): AppBuilder {
        Guard.stringIsNotEmpty(appName, 'appName must be a non-empty string');
        return new AppBuilder(appName);
    }

    private _guardNotBuilt(): void {
        if (this._built) {
            throw new Error('AppBuilder has already been built');
        }
    }

    withContainerConfiguration(fn: (container: Container) => void): this {
        this._guardNotBuilt();
        Guard.isDefined(fn, 'withContainerConfiguration fn must be defined');
        this._state.configureContainerFns.push(fn);
        return this;
    }

    withModule(moduleOrFactory: ModuleOrFactory): this {
        this._guardNotBuilt();
        Guard.isDefined(moduleOrFactory, 'moduleOrFactory must be defined');
        this._state.moduleEntries.push(moduleOrFactory);
        return this;
    }

    withInitialisation(fn: (app?: App) => Promise<void>): this {
        this._guardNotBuilt();
        Guard.isDefined(fn, 'withInitialisation fn must be defined');
        this._state.initialiseFns.push(fn);
        return this;
    }

    withStart(fn: (app?: App) => Promise<void>): this {
        this._guardNotBuilt();
        Guard.isDefined(fn, 'withStart fn must be defined');
        this._state.startFns.push(fn);
        return this;
    }

    build(): App {
        this._guardNotBuilt();
        this._built = true;
        return new DefaultApp(this._state);
    }
}
