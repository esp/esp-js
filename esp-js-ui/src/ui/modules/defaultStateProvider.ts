import ComponentFactoryState from './componentFactoryState';

interface DefaultStateProvider {
    getComponentFactoriesState(layoutMode:string):Array<ComponentFactoryState>;
}

export default DefaultStateProvider;