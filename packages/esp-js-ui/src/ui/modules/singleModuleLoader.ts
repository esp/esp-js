import * as Rx from 'rx';
import {DefaultPrerequisiteRegister} from './prerequisites';
import {Logger} from '../../core';
import {Container} from 'esp-js-di';
import {ModuleLoadResult, ModuleChangeType} from './moduleLoadResult';
import {ViewRegistryModel} from '../viewFactory';
import {StateService} from '../state';
import {ResultStage, LoadResult} from './prerequisites';
import {Module} from './module';
import {ModuleMetadata} from './moduleDecorator';
import {ModuleConstructor} from './module';

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

    public load(): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            let moduleName = this._moduleMetadata.moduleName;

            obs.onNext({
                type: ModuleChangeType.Change,
                moduleName: moduleName,
                description: `Starting module ${moduleName}`
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
                obs.onNext({
                    type: ModuleChangeType.Error,
                    moduleName,
                    errorMessage: `Failed to load module ${moduleName}`
                });
                obs.onCompleted();
                return () => {
                };
            }

            let initStream = this._buildInitStream(this.module);

            return this._preReqsLoader
                .load()
                .map((result: LoadResult) => this._mapLoadResult(result))
                .concat(initStream)
                .subscribe(obs);
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

    private _buildInitStream(module: Module): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            try {
                // We yield an "Initialising" change, just in case the .initialise() call 
                // is blocking and halts the UI for a while. We don't control the module
                // so we'd rather let consumers know where it's stuck
                obs.onNext({
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    description: `Initialising Module ${this._moduleMetadata.moduleName}`
                });

                module.initialise();
                obs.onNext({
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    description: `Initialised Module ${this._moduleMetadata.moduleName}`
                });
            } catch (e) {
                this._log.error(`Failed to initialise module ${this._moduleMetadata.moduleName}`, e);
                obs.onNext({
                    type: ModuleChangeType.Error,
                    moduleName: this._moduleMetadata.moduleName,
                    errorMessage: `Failed to load module ${this._moduleMetadata.moduleName}`
                });
                return () => {
                };
            }
        })
            .take(1);
    }

    private _mapLoadResult(result: LoadResult): ModuleLoadResult {
        switch (result.stage) {
            case ResultStage.Starting:
                return {
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    description: `${result.name} Starting`,
                    prerequisiteResult: result
                };
            case ResultStage.Completed:
                return {
                    type: ModuleChangeType.Change,
                    moduleName: this._moduleMetadata.moduleName,
                    description: `${result.name} Finished`,
                    prerequisiteResult: result
                };
            case ResultStage.Error:
                return {
                    type: ModuleChangeType.Error,
                    moduleName: this._moduleMetadata.moduleName,
                    errorMessage: result.errorMessage,
                    prerequisiteResult: result
                };
            default:
                let errorMessage = `Unknown stage from the pre-req loader for ${this._moduleMetadata.moduleName}.`;
                this._log.error(errorMessage, result);
                throw new Error(errorMessage);
        }
    }
}