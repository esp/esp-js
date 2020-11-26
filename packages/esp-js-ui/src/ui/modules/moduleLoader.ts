import * as Rx from 'rx';
import {Container} from 'esp-js-di';
import {ViewRegistryModel} from '../viewFactory';
import {StateService} from '../state/stateService';
import {ModuleLoadResult} from './moduleLoadResult';
import {SingleModuleLoader} from './singleModuleLoader';
import {ModuleConstructor, ShellModuleConstructor} from './module';
import {EspModuleDecoratorUtils, ModuleMetadata} from './moduleDecorator';
import {Router} from 'esp-js';
import {IdFactory} from '../idFactory';
import {Logger} from '../../core';
import {ViewFactoryState} from './viewFactoryState';
import {ModuleBase} from './moduleBase';
import {ShellModuleLoader} from './shellModuleLoader';

const _log = Logger.create('ModuleLoader');

export class ModuleLoader {
    private _shellModuleLoader: ShellModuleLoader;
    private _moduleLoaders: SingleModuleLoader<ModuleBase>[] = [];
    private _modalLoaderModelId = IdFactory.createId('module-loader');

    constructor(
        private _container: Container,
        private _viewRegistryModel: ViewRegistryModel,
        private _stateService:StateService,
        private _router: Router
    ) {
        // This is somewhat of a hack to avoid a race condition whereby modules that load very quickly don't allow the view registry model to process the new view factories before the modules loadLayout is called.
        // Effectively loadLayout is called right away and it can't find any of the 'enqueued to be registered' view factories.
        // The below 'ghost model' is used to pop the load layout call onto the back of the dispatch loop which will allow the router to train all other models and thus populate the view factories.
        // The proper fix for this is to make the ModuleLoader a true esp model, however I don't want to do that in the 2.0 code base as it's using the older version of rx.
        // I think this is a likely refactor for esp 4.
        this._router.addModel(this._modalLoaderModelId, {});
    }

    /**
     * takes an array of modules class that will be new-ed up, i.e. constructor functions
     */
    public loadModules(shellModuleConstructor: ShellModuleConstructor, ...moduleConstructors: Array<ModuleConstructor>): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            _log.debug(`Loading shell and ${moduleConstructors.length} additional modules`);
            return Rx.Observable
                .merge([this.loadShellModule(shellModuleConstructor), ...moduleConstructors.map(moduleCtor => this.loadModule(moduleCtor))])
                .subscribe(obs);
        });
    }

    private loadShellModule(moduleConstructor: ShellModuleConstructor): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            _log.debug(`Creating shell module loader for`);
            let moduleMetadata = EspModuleDecoratorUtils.getMetadataFromModuleClass(moduleConstructor);
            let moduleLoader = new ShellModuleLoader(
                this._container,
                this._viewRegistryModel,
                this._stateService,
                moduleConstructor,
                moduleMetadata,
            );
            this._shellModuleLoader = moduleLoader;
            return moduleLoader.load().subscribe(obs);
        });
    }

    private loadModule(moduleConstructor: ModuleConstructor): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            let moduleMetadata = EspModuleDecoratorUtils.getMetadataFromModuleClass(moduleConstructor);
            _log.debug(`Creating module loader for ${moduleMetadata.moduleKey}`);
            let moduleLoader = new SingleModuleLoader(
                this._container,
                this._viewRegistryModel,
                moduleConstructor,
                moduleMetadata,
            );
            this._moduleLoaders.push(moduleLoader);
            return moduleLoader.load().subscribe(obs);
        });
    }

    public unloadModules(): void {
        _log.debug(`'Unloading all modules`);
        this._shellModuleLoader.module.unloadViews();
        this._moduleLoaders.forEach(moduleLoader => {
            _log.debug(`'Unloading module ${moduleLoader.moduleMetadata.moduleKey} with name ${moduleLoader.moduleMetadata.moduleName}`);
            moduleLoader.disposeModule();
        });
        this._shellModuleLoader.disposeModule();
        this._moduleLoaders.length = 0;
    }

    public loadViews() {
        let viewFactoryStates: ViewFactoryState[] = this._moduleLoaders
            .filter(ml =>  !!ml.module.getDefaultStateProvider())
            .flatMap(ml => {
                return ml.module.getDefaultStateProvider().getViewFactoriesState();
            });
        this._shellModuleLoader.module.loadViews(viewFactoryStates);
    }

    // public loadViews(viewStates: ViewFactoryState[]): void;
    // public loadViews(moduleKey: string, viewStates: ViewFactoryState[]): void;
    // public loadViews(...args: any[]): void {
    //     this._router.runAction(this._modalLoaderModelId, () => {
    //         let viewStates: ViewFactoryState[], moduleKey: string = null;
    //         if (args.length === 1) {
    //             viewStates = args[0];
    //         } else {
    //             moduleKey = args[0];
    //             viewStates = args[1];
    //         }
    //         if (moduleKey) {
    //             const moduleLoader = this._findModuleLoader(moduleKey);
    //             _log.debug(`Loading layout for single module ${moduleLoader.moduleMetadata.moduleKey} with name ${moduleLoader.moduleMetadata.moduleName}`);
    //             moduleLoader.loadViews(viewStates);
    //         } else {
    //             _log.debug(`Loading layout for all modules`);
    //             this._moduleLoaders.forEach(moduleLoader => {
    //                 _log.debug(`Loading layout for ${moduleLoader.moduleMetadata.moduleKey} with name ${moduleLoader.moduleMetadata.moduleName}`);
    //                 moduleLoader.loadViews(viewStates);
    //             });
    //         }
    //     });
    // }

    private _findModuleLoader(moduleKey: string) {
        return this._moduleLoaders.find(m => m.moduleMetadata.moduleKey === moduleKey);
    }
}