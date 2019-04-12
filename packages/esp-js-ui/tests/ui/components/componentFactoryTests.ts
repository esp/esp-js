import {DisposableBase} from 'esp-js';
import {ComponentFactoryBase, stateSaveHandler, ComponentStateSet, componentFactory, ComponentInstance} from '../../../src';
import {Container} from 'esp-js-di';

@componentFactory('key', 'shortName')
class TestComponentFactory<T extends ComponentInstance> extends ComponentFactoryBase<T> {
    constructor(private _componentFactory: (state) => T) {
        super(new Container());
    }

    protected _createComponent(childContainer: Container, state?: any): T {
        return this._componentFactory(state);
    }
}

class ModelWithStateSaveDecorator extends DisposableBase {
    constructor(private _state) {
        super();
    }

    @stateSaveHandler()
    getTheState() {
        return {stateKey: this._state};
    }
}

class ModelWithStateSaveFunction extends DisposableBase {
    constructor(private _state) {
        super();
    }

    getEspUiComponentState() {
        return {stateKey: this._state};
    }
}

class ModelWithNoStateSaving extends DisposableBase {
    constructor() {
        super();
    }
    get bar() {
        return 'bar';
    }
}

describe('ComponentFactory Tests', () => {
    function runTest(cf: ComponentFactoryBase<any>) {
        let c1 = cf.createComponent('testState1');
        let c2 = cf.createComponent('testState2');
        let stateSet: ComponentStateSet = cf.getAllComponentsState();
        expect(stateSet.componentsState.length).toEqual(2);
        expect(stateSet.componentsState[0].stateKey).toEqual('testState1');
        expect(stateSet.componentsState[1].stateKey).toEqual('testState2');
    }

    it('can save state via decorators', () => {
        runTest(new TestComponentFactory(state => new ModelWithStateSaveDecorator(state)));
    });

    it('can save state via functions', () => {
        runTest(new TestComponentFactory(state => new ModelWithStateSaveFunction(state)));
    });

    it('does not blow up if the model does not save state', () => {
        let cf = new TestComponentFactory(state => new ModelWithNoStateSaving());
        let m = cf.createComponent();
        expect(m.bar).toEqual('bar');
        let stateSet: ComponentStateSet = cf.getAllComponentsState();
        expect(stateSet).toBeNull();
    });
});
