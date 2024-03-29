import {Container} from 'esp-js-di';
import {getViewFactoryMetadata, setViewFactoryMetadataOnModelInstance, ViewFactoryMetadata} from './viewFactoryDecorator';
import {Disposable, DisposableBase} from 'esp-js';
import {ViewFactoryDefaultStateProvider} from './viewFactoryDefaultStateProvider';
import {RegionRecordState} from './state';
import {StateUtils} from './stateProvider';
import * as uuid from 'uuid';

export interface ViewInstance extends Disposable {
    addDisposable(disposable: () => void);
    addDisposable(disposable: Disposable);
}

/**
 * Contains data to create a view.
 *
 * Note this is effectively a view on RegionRecordState with all properties being optional.
 */
export interface ViewCreationState<TViewState> extends Partial<Pick<RegionRecordState<TViewState>, 'stateVersion' | 'regionRecordId' | 'viewState' | 'isSelected' >> {

}

export abstract class ViewFactoryBase<TModel extends ViewInstance, TViewState = any> extends DisposableBase implements ViewFactoryDefaultStateProvider<TViewState> {
    /*
    @deprecated
     */
    private _currentViewModels: Array<ViewInstance> = [];
    private readonly _metadata: ViewFactoryMetadata;

    protected constructor(protected _container: Container) {
        super();
        this._metadata = getViewFactoryMetadata(this);

        this.addDisposable(() => {
            this.shutdownAllViews();
        });
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
        // add the child container to the model so if the model is disposed anything in it's container is also disposed
        model.addDisposable(childContainer);
        // conversely, add the model to the childContainer so if the moduel or container is disposed, then the model will be too.
        childContainer.registerInstance(uuid.v4(), model, false);
        this._storeModel(model);
        // Attach the metadata of this view factory to any model created by it.
        // This wil help with other functionality such as state saving.
        setViewFactoryMetadataOnModelInstance(model, this._metadata);
        return model;
    }

    /**
     * @deprecated stores the model locally.
     * This has been kept for backwards compatibility.
     * It will soon be removed.
     */
    private _storeModel(model: TModel) {
        model.addDisposable(() => {
            let index = this._currentViewModels.indexOf(model);
            if (index > -1) {
                this._currentViewModels.splice(index, 1);
            } else {
                throw new Error('Could not find a model in our set');
            }
        });
        this._currentViewModels.push(model);
    }

    /**
     * @deprecated view is now stored via regions.
     * This has been kept for backwards compatibility.
     * This function will soon be removed
     */
    public getAllViewsState(): any {
        let state = this._currentViewModels
            .map(c => {
                return StateUtils.tryGetState(c);
            })
            .filter(c => c != null);
        if (state.length === 0) {
            return null;
        } else {
            return {
                viewFactoryKey: this.viewKey,
                state: state
            };
        }
    }

    /**
     * @deprecated view is now stored via regions.
     * This has been kept for backwards compatibility.
     * This function will soon be removed
     */
    public shutdownAllViews(): void {
        // copy the array as we have some disposal code that remove items on disposed
        let models = this._currentViewModels.slice();
        models.forEach(model => {
            if (!model.isDisposed) {
                model.dispose();
            }
        });
        this._currentViewModels.length = 0;
    }
}
