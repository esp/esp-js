import {Container} from 'esp-js-di';
import {getViewFactoryMetadata, setViewFactoryMetadataOnModelInstance, ViewFactoryMetadata} from './viewFactoryDecorator';
import {Disposable, DisposableBase} from 'esp-js';
import {ViewFactoryDefaultStateProvider} from './viewFactoryDefaultStateProvider';
import {RegionRecordState} from './state';

export interface ViewInstance extends Disposable {
    addDisposable(disposable: () => void);
    addDisposable(disposable: Disposable);
}

/**
 * Contains data to create a view.
 *
 * Note this is effectively a view on RegionRecordState with all properties being optional.
 */
export interface ViewCreationState<TViewState> extends Partial<Pick<RegionRecordState<TViewState>, 'stateVersion' | 'regionRecordId' | 'viewState'>> {

}

export abstract class ViewFactoryBase<TModel extends ViewInstance, TViewState = any> extends DisposableBase implements ViewFactoryDefaultStateProvider<TViewState> {
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
     * @param viewCreationState:
     * @private
     */
    protected abstract _createView(childContainer: Container, viewCreationState?: ViewCreationState<TViewState>): TModel;

    public createView(viewCreationState: ViewCreationState<TViewState> = null): TModel {
        let childContainer = this._container.createChildContainer();
        let model: TModel = this._createView(childContainer, viewCreationState);
        model.addDisposable(childContainer);
        // Attach the metadata of this view factory to any model created by it.
        // This wil help with other functionality such as state saving.
        setViewFactoryMetadataOnModelInstance(model, this._metadata);
        return model;
    }
}
