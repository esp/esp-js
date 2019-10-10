import {Router, observeEvent, Guard} from 'esp-js';
import {Logger} from '../../core';
import {ModelBase} from '../modelBase';
import {getViewFactoryMetadata, ViewFactoryMetadata} from './index';
import {ViewFactoryBase} from './viewFactoryBase';

const _log = Logger.create('ViewRegistryModel');

export interface ViewMetadata {
    viewFactoryKey: string;
    shortName: string;
}

export interface FactoryEntry {
    viewFactoryKey: string;
    factory: ViewFactoryBase<ModelBase>;
    shortName: string;
    customMetadata?: any;
    moduleName: string;
    moduleKey: string;
}

interface KeyToFactoryEntryMap {
    [key: string]: FactoryEntry;
}

export class ViewRegistryModel extends ModelBase {

    public static ModelId = 'esp-view-registry';

    private _viewFactoriesEntries: KeyToFactoryEntryMap = {};
    public viewsMetadata: Array<ViewMetadata>;

    constructor(router: Router) {
        // this model is designed as a singelton so we effectively hard code the ID here
        super(ViewRegistryModel.ModelId, router);
        this.observeEvents();
    }

    public get viewFactories(): Array<FactoryEntry> {
        let entries = [];
        for (let key in this._viewFactoriesEntries) { //tslint:disable-line
            entries.push(this._viewFactoriesEntries[key]);
        }
        return entries;
    }

    public postProcess(): void {
        this.viewsMetadata = [...this._getViewsMetaData()];
    }

    public registerViewFactory(moduleKey: string, moduleName: string, viewFactory: ViewFactoryBase<ModelBase>): void {
        this.ensureOnDispatchLoop(() => {
            Guard.isDefined(viewFactory, 'viewFactory must be defined');
            let metadata: ViewFactoryMetadata = getViewFactoryMetadata(viewFactory);
            Guard.isFalsey(this._viewFactoriesEntries.hasOwnProperty(metadata.viewKey), `view factory with id [${metadata.viewKey}] already added`);
            _log.debug(`registering view factory with key [${metadata.viewKey}], short name [${metadata.shortName}]`);
            this._viewFactoriesEntries[metadata.viewKey] = Object.freeze({
                viewFactoryKey: metadata.viewKey,
                factory: viewFactory,
                shortName: metadata.shortName,
                customMetadata: metadata.customMetadata,
                moduleName: moduleName,
                moduleKey: moduleKey
            });
        });
    }

    public unregisterViewFactory(viewFactory: ViewFactoryBase<ModelBase>): void {
        this.ensureOnDispatchLoop(() => {
            let metadata: ViewFactoryMetadata = getViewFactoryMetadata(viewFactory);
            Guard.isDefined(viewFactory, 'viewFactory must be defined');
            _log.debug(`unregistering view factory with viewFactoryKey [${metadata.viewKey}]`);
            delete this._viewFactoriesEntries[metadata.viewKey];
        });
    }

    @observeEvent('createView')
    private _onCreateView(event): void {
        _log.verbose('Creating view with view key {0}', event.viewFactoryKey);
        this._createView(event.viewFactoryKey);
    }

    public hasViewFacotory(viewFactoryKey: string) {
        return this._viewFactoriesEntries.hasOwnProperty(viewFactoryKey);
    }

    public getViewFactory<T extends ModelBase>(viewFactoryKey: string): ViewFactoryBase<T> {
        let entry: FactoryEntry = this._viewFactoriesEntries[viewFactoryKey];
        Guard.isDefined(entry, `viewFactory with key ${viewFactoryKey} not registered`);
        return <ViewFactoryBase<T>>entry.factory;
    }

    private _getViewsMetaData(): Array<ViewMetadata> {
        let entries = [];
        for (let key in this._viewFactoriesEntries) { //tslint:disable-line
            let entry = this._viewFactoriesEntries[key];
            entries.push({
                viewFactoryKey: entry.viewFactoryKey,
                shortName: entry.shortName
            });
        }
        return entries;
    }

    private _createView(viewFactoryKey: string): void {
        this._ensureViewRegistered(viewFactoryKey);
        let entry = this._viewFactoriesEntries[viewFactoryKey];
        entry.factory.createView();
    }

    private _ensureViewRegistered(viewFactoryKey: string): void {
        Guard.isTruthy((viewFactoryKey in this._viewFactoriesEntries), `view with key [${viewFactoryKey}] not registered`);
    }
}
