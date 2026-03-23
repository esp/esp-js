import * as esp from '../src';
import {
    Router,
    ObservationStage,
    DefaultEventContext,
    CompositeDisposable,
    DictionaryDisposable,
    DisposableBase,
    DisposableWrapper,
    Guard,
    ModelBuilder,
    Subscribable,
} from '../src';

describe('index exports', () => {
    it('should export Router', () => {
        expect(esp.Router).toBeDefined();
        expect(Router).toBeDefined();
    });

    it('should export ObservationStage', () => {
        expect(esp.ObservationStage).toBeDefined();
        expect(ObservationStage).toBeDefined();
    });

    it('should export DefaultEventContext', () => {
        expect(esp.DefaultEventContext).toBeDefined();
        expect(DefaultEventContext).toBeDefined();
    });

    it('should export CompositeDisposable', () => {
        expect(esp.CompositeDisposable).toBeDefined();
        expect(CompositeDisposable).toBeDefined();
    });

    it('should export DictionaryDisposable', () => {
        expect(esp.DictionaryDisposable).toBeDefined();
        expect(DictionaryDisposable).toBeDefined();
    });

    it('should export DisposableBase', () => {
        expect(esp.DisposableBase).toBeDefined();
        expect(DisposableBase).toBeDefined();
    });

    it('should export DisposableWrapper', () => {
        expect(esp.DisposableWrapper).toBeDefined();
        expect(DisposableWrapper).toBeDefined();
    });

    it('should export Guard', () => {
        expect(Guard).toBeDefined();
    });

    it('should export ModelBuilder', () => {
        expect(esp.ModelBuilder).toBeDefined();
        expect(ModelBuilder).toBeDefined();
    });

    it('should export Subscribable type', () => {
        // Subscribable is a type/interface, verify it is usable as a type annotation
        const router = new Router();
        router.modelBuilder('test', { value: 0 }).build();
        const s: Subscribable<{ value: number }> = router.getModelObservable('test');
        expect(s).toBeDefined();
    });
});
