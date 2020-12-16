import {Container} from 'esp-js-di';
import {getViewFactoryMetadata, setViewFactoryMetadataOnModelInstance, ViewFactoryMetadata} from './viewFactoryDecorator';
import {Disposable, DisposableBase} from 'esp-js';
import {ViewFactoryDefaultStateProvider} from './viewFactoryDefaultStateProvider';
import {PersistedViewState} from './state';

export interface ViewInstance extends Disposable {
    addDisposable(disposable: () => void);
    addDisposable(disposable: Disposable);
}

export abstract class ViewFactoryBase<TModel extends ViewInstance, TViewState = object> extends DisposableBase implements ViewFactoryDefaultStateProvider<TViewState> {
    private readonly _metadata: ViewFactoryMetadata;

    protected constructor(protected _container: Container) {
        super();
        this._metadata = getViewFactoryMetadata(this);
    }

    public getDefaultViewState(): TViewState[]  {
        return [];
    }

    public get viewKey(): string {
        return this._metadata.viewKey;
    }

    public get shortName(): string {
        return this._metadata.shortName;
    }

    public get metadata(): ViewFactoryMetadata {
        return this._metadata;
    }

    public get customMetadata(): any {
        return this._metadata.customMetadata;
    }

    /**
     * Creates a view.
     *
     * This must return the model that manages the view.
     *
     * @param childContainer: The esp-js-di child container for the view
     * @param persistedViewState: The state that should be loaded by the view
     * @private
     */
    protected abstract _createView(childContainer: Container, persistedViewState?: PersistedViewState<TViewState>): TModel;

    public createView(persistedViewState: PersistedViewState<TViewState> = null): TModel {
        let childContainer = this._container.createChildContainer();
        let model: TModel = this._createView(childContainer, persistedViewState);
        model.addDisposable(childContainer);
        // Attach the metadata of this view factory to any model created by it.
        // This wil help with other functionality such as state saving.
        setViewFactoryMetadataOnModelInstance(model, this._metadata);
        return model;
    }
}
