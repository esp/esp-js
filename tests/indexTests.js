import esp from '../src';

import {
    Router,
    ObservationStage,
    SingleModelRouter,
    EventContext,
    CompositeDisposable,
    DictionaryDisposable,
    DisposableBase,
    ModelChangedEvent,
    Observable,
    observeEvent,
    observeModelChangedEvent,
    model,
    logging,
    DisposableWrapper
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

    it('should export SingleModelRouter', () => {
        expect(esp.SingleModelRouter).toBeDefined();
        expect(SingleModelRouter).toBeDefined();
    });

    it('should export EventContext', () => {
        expect(esp.EventContext).toBeDefined();
        expect(EventContext).toBeDefined();
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

    it('should export Observable', () => {
        expect(esp.Observable).toBeDefined();
        expect(Observable).toBeDefined();
    });

    it('should export observeEvent', () => {
        expect(esp.observeEvent).toBeDefined();
        expect(observeEvent).toBeDefined();
    });

    it('should export observeModelChangedEvent', () => {
        expect(esp.observeModelChangedEvent).toBeDefined();
        expect(observeModelChangedEvent).toBeDefined();
    });

    it('should export ModelChangedEvent', () => {
        expect(esp.ModelChangedEvent).toBeDefined();
        expect(ModelChangedEvent).toBeDefined();
    });

    it('should export logging', () => {
        expect(esp.logging).toBeDefined();
        expect(esp.logging.level).toBeDefined();
        expect(esp.logging.sink).toBeDefined();
        expect(esp.logging.Logger).toBeDefined();
        expect(logging).toBeDefined();
    });
});