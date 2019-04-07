import * as esp from '../src';
import {
    Router,
    ObservationStage,
    SingleModelRouter,
    DefaultEventContext,
    CompositeDisposable,
    DictionaryDisposable,
    DisposableBase,
    Observable,
    Subject,
    RouterObservable,
    RouterSubject,
    observeEvent,
    logging,
    DisposableWrapper,
    Guard,
    EspDecoratorUtil,
    DecoratorTypes,
    EspMetadata,
    EspDecoratedObject,
    EventObservationMetadata,
    isEspDecoratedObject

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

    it('should export Observable', () => {
        expect(esp.Observable).toBeDefined();
        expect(Observable).toBeDefined();
    });

    it('should export Subject', () => {
        expect(esp.Subject).toBeDefined();
        expect(Subject).toBeDefined();
    });

    it('should export RouterSubject', () => {
        expect(esp.RouterSubject).toBeDefined();
        expect(RouterSubject).toBeDefined();
    });

    it('should export RouterObservable', () => {
        expect(esp.RouterObservable).toBeDefined();
        expect(RouterObservable).toBeDefined();
    });

    it('should export observeEvent', () => {
        expect(esp.observeEvent).toBeDefined();
        expect(observeEvent).toBeDefined();
    });

    it('should export logging', () => {
        expect(esp.logging).toBeDefined();
        expect(esp.logging.Level).toBeDefined();
        expect(esp.logging.consoleSink).toBeDefined();
        expect(esp.logging.Logger).toBeDefined();
        expect(logging).toBeDefined();
    });

    it('should export Guard', () => {
        expect(Guard).toBeDefined();
    });

    it('should export decorator metadata', () => {
        expect(esp.EspDecoratorUtil).toBeDefined();
        expect(esp.DecoratorTypes).toBeDefined();
        expect(esp.isEspDecoratedObject).toBeDefined();

        expect(EspDecoratorUtil).toBeDefined();
        expect(DecoratorTypes).toBeDefined();
        expect(isEspDecoratedObject).toBeDefined();
    });
});