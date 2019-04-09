import {Container} from 'esp-js-di';
import {getComponentFactoryMetadata} from './componentDecorator';
import {DisposableBase, utils, EspDecoratorUtil} from 'esp-js';
import {ComponentFactoryMetadata} from './componentDecorator';
import {Disposable} from 'esp-js';
import {StateSaveHandlerConsts, StateSaveHandlerMetadata} from './stateSaveHandler';

export interface ComponentStateSet {
    componentFactoryKey: string;
    componentsState: Array<any>;
}

export interface ComponentInstance extends Disposable {
    addDisposable(disposable: () => void);
    addDisposable(disposable: Disposable);
}

export abstract class ComponentFactoryBase<T extends ComponentInstance> extends DisposableBase {
    private _currentComponents: Array<ComponentInstance>;
    private _metadata: ComponentFactoryMetadata;

    protected constructor(protected _container: Container) {
        super();
        this._currentComponents = [];
        this._metadata = getComponentFactoryMetadata(this);
    }

    public get componentKey(): string {
        return this._metadata.componentKey;
    }

    public get shortName(): string {
        return this._metadata.shortName;
    }

    public get customMetadata(): any {
        return this._metadata.customMetadata;
    }

    protected abstract _createComponent(childContainer: Container, state?: any): T;

    public createComponent(state = null): T {
        let childContainer = this._container.createChildContainer();
        let component: T = this._createComponent(childContainer, state);
        component.addDisposable(childContainer);
        component.addDisposable(() => {
            let index = this._currentComponents.indexOf(component);
            if (index > -1) {
                this._currentComponents.splice(index, 1);
            } else {
                throw new Error('Could not find a component in our set');
            }
        });
        this._currentComponents.push(component);
        return component;
    }

    public getAllComponentsState(): ComponentStateSet {
        let componentsState = this._currentComponents
            .map(c => {
                // try see if there was a @stateSaveHandler decorator on the component,
                // if so invoke the function it was declared on to get the state.
                if (EspDecoratorUtil.hasMetadata(c)) {
                    let metadata: StateSaveHandlerMetadata = EspDecoratorUtil.getCustomData(c, StateSaveHandlerConsts.CustomDataKey);
                    if (metadata) {
                        return c[metadata.functionName]();
                    }
                }
                // else see if there is a function with name StateSaveHandlerConsts.HandlerFunctionName
                let stateSaveHandlerFunction = c[StateSaveHandlerConsts.HandlerFunctionName];
                if (stateSaveHandlerFunction && utils.isFunction(stateSaveHandlerFunction)) {
                    return stateSaveHandlerFunction.call(c);
                }
                return null;
            })
            .filter(c => c != null);
        if (componentsState.length === 0) {
            return null;
        } else {
            return {
                componentFactoryKey: this.componentKey,
                componentsState: componentsState
            };
        }
    }

    public shutdownAllComponents(): void {
        // copy the array as we have some disposal code that remove items on disposed
        let components = this._currentComponents.slice();
        components.forEach(component => {
            component.dispose();
        });
        this._currentComponents.length = 0;
    }
}
