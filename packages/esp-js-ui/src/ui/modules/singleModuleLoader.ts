import * as Rx from 'rx';
import {DefaultPrerequisiteRegistrar} from './prerequisites';
import {Logger} from '../../core';
import {Container} from 'esp-js-di';
import {ModuleLoadResult, ModuleChangeType} from './moduleLoadResult';
import {ComponentRegistryModel} from '../components';
import {ModuleDescriptor} from './moduleDescriptor';
import {StateService} from '../state';
import {ResultStage, LoadResult} from './prerequisites';
import {Module} from './module';

export class SingleModuleLoader {
    private readonly _preReqsLoader: DefaultPrerequisiteRegistrar;
    private _log: Logger;

    public functionalModule: Module;

    constructor(private _container: Container,
                private _componentRegistryModel: ComponentRegistryModel,
                private _stateService: StateService,
                private _descriptor: ModuleDescriptor
    ) {

        this._log = Logger.create(`SingleModuleLoader-${this._descriptor.moduleName}`);
        this._preReqsLoader = new DefaultPrerequisiteRegistrar();
    }

    public load(): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            let moduleName = this._descriptor.moduleName;
            obs.onNext({
                type: ModuleChangeType.Change,
                moduleName: moduleName,
                description: `Starting module ${moduleName}`
            });

            try {
                this._log.debug(`Creating module ${moduleName}`);

                let FunctionalModule = this._descriptor.factory;
                this.functionalModule = new FunctionalModule(
                    this._container.createChildContainer(),
                    this._stateService
                );

                this._log.debug(`Configuring Container for ${moduleName}`);
                this.functionalModule.configureContainer();

                this._log.debug(`Registering Components for ${moduleName}`);
                this.functionalModule.registerComponents(this._componentRegistryModel);

                this._log.debug(`Registering prereqs for ${moduleName}`);
                this.functionalModule.registerPrerequisites(this._preReqsLoader);
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

            let initStream = this._buildInitStream(this.functionalModule);

            return this._preReqsLoader
                .load()
                .map((result: LoadResult) => this._mapLoadResult(result))
                .concat(initStream)
                .subscribe(obs);
        });
    }

    public loadModuleLayout(layoutMode: string): void {
        if (!this.functionalModule) {
            return;
        }
        this.functionalModule.loadLayout(layoutMode, this._componentRegistryModel);
    }

    public unloadModuleLayout(): void {
        if (!this.functionalModule) {
            return;
        }
        this.functionalModule.unloadLayout();
    }

    public disposeModule(): void {
        if (!this.functionalModule) {
            return;
        }
        this.functionalModule.dispose();
    }

    private _buildInitStream(functionalModule: Module): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            try {
                // We yield an "Initialising" change, just in case the .initialise() call 
                // is blocking and halts the UI for a while. We don't control the module
                // so we'd rather let consumers know where it's stuck
                obs.onNext({
                    type: ModuleChangeType.Change,
                    moduleName: this._descriptor.moduleName,
                    description: `Initialising Module ${this._descriptor.moduleName}`
                });

                functionalModule.initialise();
                obs.onNext({
                    type: ModuleChangeType.Change,
                    moduleName: this._descriptor.moduleName,
                    description: `Initialised Module ${this._descriptor.moduleName}`
                });
            } catch (e) {
                this._log.error(`Failed to initialise module ${this._descriptor.moduleName}`, e);
                obs.onNext({
                    type: ModuleChangeType.Error,
                    moduleName: this._descriptor.moduleName,
                    errorMessage: `Failed to load module ${this._descriptor.moduleName}`
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
                    moduleName: this._descriptor.moduleName,
                    description: `${result.name} Starting`,
                    prerequisiteResult: result
                };
            case ResultStage.Completed:
                return {
                    type: ModuleChangeType.Change,
                    moduleName: this._descriptor.moduleName,
                    description: `${result.name} Finished`,
                    prerequisiteResult: result
                };
            case ResultStage.Error:
                return {
                    type: ModuleChangeType.Error,
                    moduleName: this._descriptor.moduleName,
                    errorMessage: result.errorMessage,
                    prerequisiteResult: result
                };
            default:
                let errorMessage = `Unknown stage from the pre-req loader for ${this._descriptor.moduleName}.`;
                this._log.error(errorMessage, result);
                throw new Error(errorMessage);
        }
    }
}