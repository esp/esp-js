import * as Rx from 'rx';
import {DefaultPrerequisiteRegister} from './prerequisites';
import {LoadResult, ResultStage} from './prerequisites';
import {Container} from 'esp-js-di';
import {ModuleChangeType, ModuleLoadResult} from './moduleLoadResult';
import {ViewRegistryModel} from '../viewFactory';
import {Module} from './module';
import {ModuleMetadata} from './moduleDecorator';
import { Logger } from '../../core';

export abstract class SingleModuleLoaderBase<TModule extends Module> {
    private readonly _preReqsLoader: DefaultPrerequisiteRegister;
    private _log: Logger;
    private _module: TModule;

    public get module(): TModule {
        return this._module;
    }

    protected constructor(
        protected _container: Container,
        protected _viewRegistryModel: ViewRegistryModel,
        protected _moduleMetadata: ModuleMetadata
    ) {
        this._log = Logger.create(`SingleModuleLoader-${this._moduleMetadata.moduleKey}`);
        this._preReqsLoader = new DefaultPrerequisiteRegister();
    }

    public get moduleMetadata(): ModuleMetadata {
        return this._moduleMetadata;
    }

    protected abstract _createModule(): TModule;

    public load(): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            let moduleName = this._moduleMetadata.moduleName;
            let moduleKey = this._moduleMetadata.moduleKey;

            obs.onNext(<ModuleLoadResult>{
                type: ModuleChangeType.Change,
                moduleName: moduleName,
                moduleKey,
                description: `Module loading`,
                hasCompletedLoaded: false
            });

            try {
                this._log.debug(`Creating module ${moduleName}`);

                this._module = this._createModule();

                this._log.debug(`Configuring Container for ${moduleName}`);
                this.module.configureContainer();

                this._log.debug(`Registering Components for ${moduleName}`);
                this.module.registerViewFactories(this._viewRegistryModel);

                this._log.debug(`Registering prereqs for ${moduleName}`);
                this.module.registerPrerequisites(this._preReqsLoader);
            } catch (e) {
                this._log.error(`Failed to create module ${moduleName}`, e);
                obs.onNext(<ModuleLoadResult>{
                    type: ModuleChangeType.Error,
                    moduleName,
                    moduleKey,
                    errorMessage: `Module load failed`,
                    prerequisiteResult: {
                        stage: ResultStage.Error,
                        name: `Module bootstrapping`,
                        errorMessage: `Failed to load module ${moduleName}`
                    },
                    hasCompletedLoaded: false
                });
                obs.onCompleted();
                return () => {
                };
            }

            let initStream = this._buildInitStream(this.module);

            return this._preReqsLoader
                .load()
                .map((result: LoadResult) => this._mapPreReqsLoadResult(result))
                .concat(initStream)
                .subscribe(obs);
        });
    }

    public disposeModule(): void {
        if (!this.module) {
            return;
        }
        this.module.dispose();
    }

    private _buildInitStream(module: Module): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            try {
                // We yield an "Initialising" change, just in case the .initialise() call 
                // is blocking and halts the UI for a while. We don't control the module
                // so we'd rather let consumers know where it's stuck
                obs.onNext({
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    description: `Module initialising`,
                    hasCompletedLoaded: false
                });
                module.initialise();
                obs.onNext({
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    description: `Module initialised`,
                    hasCompletedLoaded: true
                });
                obs.onCompleted();
            } catch (e) {
                this._log.error(`Failed to initialise module ${this._moduleMetadata.moduleName}`, e);
                obs.onNext({
                    type: ModuleChangeType.Error,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    errorMessage: `Module initialisation failed`,
                    hasCompletedLoaded: false
                });
                obs.onCompleted();
                return () => {
                };
            }
        });
    }

    private _mapPreReqsLoadResult(result: LoadResult): ModuleLoadResult {
        switch (result.stage) {
            case ResultStage.Starting:
                return {
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    description: `${result.name} Starting`,
                    prerequisiteResult: result,
                    hasCompletedLoaded: false
                };
            case ResultStage.Completed:
                return {
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    description: `${result.name} Finished`,
                    prerequisiteResult: result,
                    hasCompletedLoaded: false
                };
            case ResultStage.Error:
                return {
                    type: ModuleChangeType.Error,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    errorMessage: result.errorMessage,
                    prerequisiteResult: result,
                    hasCompletedLoaded: false
                };
            default:
                let errorMessage = `Unknown stage from the pre-req loader for ${this._moduleMetadata.moduleName} key ${this._moduleMetadata.moduleKey}.`;
                this._log.error(errorMessage, result);
                throw new Error(errorMessage);
        }
    }
}