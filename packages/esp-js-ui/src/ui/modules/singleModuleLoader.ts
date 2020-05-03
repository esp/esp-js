import {concat, Observable, Subscriber} from 'rxjs';
import {DefaultPrerequisiteRegister} from './prerequisites';
import {LoadResult, ResultStage} from './prerequisites';
import {Logger} from '../../core';
import {Container} from 'esp-js-di';
import {ModuleChangeType, ModuleLoadResult} from './moduleLoadResult';
import {ViewRegistryModel} from '../viewFactory';
import {StateService} from '../state';
import {Module} from './module';
import {ModuleConstructor} from './module';
import {ModuleMetadata} from './moduleDecorator';
import {map} from 'rxjs/operators';

export class SingleModuleLoader {
    private readonly _preReqsLoader: DefaultPrerequisiteRegister;
    private _log: Logger;

    public module: Module;

    constructor(
        private _container: Container,
        private _viewRegistryModel: ViewRegistryModel,
        private _stateService: StateService,
        private _moduleConstructor: ModuleConstructor,
        private _moduleMetadata: ModuleMetadata
    ) {
        this._log = Logger.create(`SingleModuleLoader-${this._moduleMetadata.moduleKey}`);
        this._preReqsLoader = new DefaultPrerequisiteRegister();
    }

    public get moduleMetadata(): ModuleMetadata {
        return this._moduleMetadata;
    }

    public load(): Observable<ModuleLoadResult> {
        return new Observable((obs: Subscriber<ModuleLoadResult>) => {
            let moduleName = this._moduleMetadata.moduleName;
            let moduleKey = this._moduleMetadata.moduleKey;

            obs.next(<ModuleLoadResult>{
                type: ModuleChangeType.Change,
                moduleName: moduleName,
                moduleKey,
                description: `Module loading`,
                hasCompletedLoaded: false
            });

            try {
                this._log.debug(`Creating module ${moduleName}`);

                this.module = new this._moduleConstructor(
                    this._container.createChildContainer(),
                    this._stateService
                );

                this._log.debug(`Configuring Container for ${moduleName}`);
                this.module.configureContainer();

                this._log.debug(`Registering Components for ${moduleName}`);
                this.module.registerViewFactories(this._viewRegistryModel);

                this._log.debug(`Registering prereqs for ${moduleName}`);
                this.module.registerPrerequisites(this._preReqsLoader);
            } catch (e) {
                this._log.error(`Failed to create module ${moduleName}`, e);
                obs.next(<ModuleLoadResult>{
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
                obs.complete();
                return () => {
                };
            }

            let initStream = this._buildInitStream(this.module);

            let preReqsStream = this._preReqsLoader
                .load()
                .pipe(
                    map((result: LoadResult) => this._mapPreReqsLoadResult(result))
                );
            return concat(preReqsStream, initStream).subscribe(obs);
        });
    }

    public loadModuleLayout(layoutMode: string): void {
        if (!this.module) {
            return;
        }
        this.module.loadLayout(layoutMode, this._viewRegistryModel);
    }

    public unloadModuleLayout(): void {
        if (!this.module) {
            return;
        }
        this.module.unloadLayout();
    }

    public disposeModule(): void {
        if (!this.module) {
            return;
        }
        this.module.dispose();
    }

    private _buildInitStream(module: Module): Observable<ModuleLoadResult> {
        return new Observable((obs: Subscriber<ModuleLoadResult>) => {
            try {
                // We yield an "Initialising" change, just in case the .initialise() call 
                // is blocking and halts the UI for a while. We don't control the module
                // so we'd rather let consumers know where it's stuck
                obs.next({
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    description: `Module initialising`,
                    hasCompletedLoaded: false
                });
                module.initialise();
                obs.next({
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    description: `Module initialised`,
                    hasCompletedLoaded: true
                });
                obs.complete();
            } catch (e) {
                this._log.error(`Failed to initialise module ${this._moduleMetadata.moduleName}`, e);
                obs.next({
                    type: ModuleChangeType.Error,
                    moduleName: this._moduleMetadata.moduleName,
                    moduleKey: this._moduleMetadata.moduleKey,
                    errorMessage: `Module initialisation failed`,
                    hasCompletedLoaded: false
                });
                obs.complete();
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