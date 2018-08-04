import {Container} from 'microdi-js';
import {getComponentFactoryMetadata} from './componentDecorator';
import {DisposableBase} from 'esp-js';
import {ModelBase} from '../modelBase';
import {ComponentFactoryMetadata} from './componentDecorator';

export interface ComponentStateSet {
    componentFactoryKey: string;
    componentsState: Array<any>;
}

export abstract class ComponentFactoryBase extends DisposableBase {
    private _currentComponents: Array<ModelBase>;
    private _metadata: ComponentFactoryMetadata;

    protected constructor(private _container: Container) {
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

    protected abstract _createComponent(childContainer: Container, state?: any): any;

    public createComponent(state = null): void {
        let childContainer = this._container.createChildContainer();
        let component: ModelBase = this._createComponent(childContainer, state);
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
    }

    public getAllComponentsState(): ComponentStateSet {
        if (this._currentComponents.length === 0) {
            return null;
        }
        let componentsState = this._currentComponents
            .map(c => c.getState())
            .filter(c => c != null);
        return {
            componentFactoryKey: this.componentKey,
            componentsState: componentsState
        };
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
