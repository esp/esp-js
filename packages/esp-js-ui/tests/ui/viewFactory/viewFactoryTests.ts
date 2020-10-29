import {DisposableBase} from 'esp-js';
import {ViewFactoryBase, stateProvider, ViewFactoryState, viewFactory, ViewInstance} from '../../../src';
import {Container} from 'esp-js-di';

@viewFactory('key', 'shortName')
class TestViewFactory<T extends ViewInstance> extends ViewFactoryBase<T> {
    constructor(private _stubViewFactory: (state) => T) {
        super(new Container());
    }

    protected _createView(childContainer: Container, state?: any): T {
        return this._stubViewFactory(state);
    }
}

class ModelWithStateSaveDecorator extends DisposableBase {
    constructor(private _state) {
        super();
    }

    @stateProvider()
    getTheState() {
        return {stateKey: this._state};
    }
}

class ModelWithStateSaveFunction extends DisposableBase {
    constructor(private _state) {
        super();
    }

    getEspUiModelState() {
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

describe('ViewFactory Tests', () => {
    function runTest(cf: ViewFactoryBase<any>) {
        let c1 = cf.createView('testState1');
        let c2 = cf.createView('testState2');
        let stateSet: ViewFactoryState = cf.getAllViewsState();
        expect(stateSet.state.length).toEqual(2);
        expect(stateSet.state[0].stateKey).toEqual('testState1');
        expect(stateSet.state[1].stateKey).toEqual('testState2');
    }

    it('can save state via decorators', () => {
        runTest(new TestViewFactory(state => new ModelWithStateSaveDecorator(state)));
    });

    it('can save state via functions', () => {
        runTest(new TestViewFactory(state => new ModelWithStateSaveFunction(state)));
    });

    it('does not blow up if the model does not save state', () => {
        let cf = new TestViewFactory(state => new ModelWithNoStateSaving());
        let m = cf.createView();
        expect(m.bar).toEqual('bar');
        let stateSet: ViewFactoryState = cf.getAllViewsState();
        expect(stateSet).toBeNull();
    });
});
