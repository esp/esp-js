import esp from '../src';

import {
    Router,
    ObservationStage,
    SingleModelRouter,
    EventContext,
    CompositeDisposable,
    DictionaryDisposable,
    Observable,
    observeEvent,
    observeModelChangedEvent,
    model,
    logging
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

    it('should export model', () => {
        expect(esp.model).toBeDefined();
        expect(esp.model.DisposableBase).toBeDefined();
        expect(esp.model.ModelBase).toBeDefined();
        expect(esp.model.ModelRootBase).toBeDefined();
        expect(esp.model.events.ModelChangedEvent).toBeDefined();
        expect(model).toBeDefined();
    });

    it('should export logging', () => {
        expect(esp.logging).toBeDefined();
        expect(esp.logging.level).toBeDefined();
        expect(esp.logging.sink).toBeDefined();
        expect(esp.logging.Logger).toBeDefined();
        expect(logging).toBeDefined();
    });
});