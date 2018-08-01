import {ComponentFactoryState} from './componentFactoryState';

export interface DefaultStateProvider {
    getComponentFactoriesState(layoutMode:string):Array<ComponentFactoryState>;
}