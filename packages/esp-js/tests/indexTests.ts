import * as esp from '../src';
import {
    EventBus,
    ObservationStage,
    DefaultEventContext,
    CompositeDisposable,
    DictionaryDisposable,
    DisposableBase,
    DisposableWrapper,
    Guard,
    StoreBuilder,
    Subscribable,
} from '../src';

describe('index exports', () => {
    it('should export EventBus', () => {
        expect(esp.EventBus).toBeDefined();
        expect(EventBus).toBeDefined();
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

    it('should export StoreBuilder', () => {
        expect(esp.StoreBuilder).toBeDefined();
        expect(StoreBuilder).toBeDefined();
    });

    it('should export Subscribable type', () => {
        // Subscribable is a type/interface, verify it is usable as a type annotation
        const bus = new EventBus();
        bus.storeBuilder('test', { value: 0 }).build();
        const s: Subscribable<{ value: number }> = bus.getModelObservable('test');
        expect(s).toBeDefined();
    });
});
