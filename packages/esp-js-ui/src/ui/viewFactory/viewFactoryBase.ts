import {Container} from 'esp-js-di';
import {getViewFactoryMetadata, setViewFactoryMetadataOnModelInstance, ViewFactoryMetadata} from './viewFactoryDecorator';
import {Disposable, DisposableBase, EspDecoratorUtil, utils} from 'esp-js';
import {ViewFactoryDefaultStateProvider} from './viewFactoryDefaultStateProvider';
import {RegionRecordState} from './state';
import {StateSaveProviderConsts, StateSaveProviderMetadata} from './stateProvider';

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
    /*
    @deprecated
     */
    private _currentViewModels: Array<ViewInstance> = [];
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
                // try see if there was a @stateProvider decorator on the views model,
                // if so invoke the function it was declared on to get the state.
                if (EspDecoratorUtil.hasMetadata(c)) {
                    let metadata: StateSaveProviderMetadata = EspDecoratorUtil.getCustomData(c, StateSaveProviderConsts.CustomDataKey);
                    if (metadata) {
                        return c[metadata.functionName]();
                    }
                }
                // else see if there is a function with name StateSaveProviderConsts.HandlerFunctionName
                let stateProviderFunction = c[StateSaveProviderConsts.HandlerFunctionName];
                if (stateProviderFunction && utils.isFunction(stateProviderFunction)) {
                    return stateProviderFunction.call(c);
                }
                return null;
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
            model.dispose();
        });
        this._currentViewModels.length = 0;
    }
}
