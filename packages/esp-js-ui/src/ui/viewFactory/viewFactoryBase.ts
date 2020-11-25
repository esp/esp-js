import {Container} from 'esp-js-di';
import {getViewFactoryMetadata, setViewFactoryMetadataOnModelInstance} from './viewFactoryDecorator';
import {DisposableBase, utils, EspDecoratorUtil} from 'esp-js';
import {ViewFactoryMetadata} from './viewFactoryDecorator';
import {Disposable} from 'esp-js';
import {StateSaveProviderConsts, StateSaveProviderMetadata} from './stateProvider';
import {ViewFactoryState} from '../modules';

export interface ViewInstance extends Disposable {
    addDisposable(disposable: () => void);
    addDisposable(disposable: Disposable);
}

export abstract class ViewFactoryBase<T extends ViewInstance> extends DisposableBase {
    private _currentViewModels: Array<ViewInstance>;
    private _metadata: ViewFactoryMetadata;

    protected constructor(protected _container: Container) {
        super();
        this._currentViewModels = [];
        this._metadata = getViewFactoryMetadata(this);
    }

    public get viewKey(): string {
        return this._metadata.viewKey;
    }

    public get shortName(): string {
        return this._metadata.shortName;
    }

    public get customMetadata(): any {
        return this._metadata.customMetadata;
    }

    /**
     * A version which will be associated with any state saved for this view factory.
     */
    public get stateVersion() {
        return 1;
    }

    /**
     * Creates a view.
     *
     * This must return the model that manages the view.
     *
     * @param childContainer: The esp-js-di child container for the view
     * @param state: Any state that should be loaded by the view
     * @private
     */
    protected abstract _createView(childContainer: Container, state?: any): T;

    public createView(state = null): T {
        let childContainer = this._container.createChildContainer();
        let model: T = this._createView(childContainer, state);
        model.addDisposable(childContainer);
        model.addDisposable(() => {
            let index = this._currentViewModels.indexOf(model);
            if (index > -1) {
                this._currentViewModels.splice(index, 1);
            } else {
                throw new Error('Could not find a model in our set');
            }
        });
        // Attach the metadata of this view factory to any model created by it.
        // This wil help with other functionality such as state saving.
        setViewFactoryMetadataOnModelInstance(model, this._metadata);
        this._currentViewModels.push(model);
        return model;
    }

    public getAllViewsState(): ViewFactoryState {
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
                state: state,
                stateVersion: this.stateVersion
            };
        }
    }

    public shutdownAllViews(): void {
        // copy the array as we have some disposal code that remove items on disposed
        let models = this._currentViewModels.slice();
        models.forEach(model => {
            model.dispose();
        });
        this._currentViewModels.length = 0;
    }
}
