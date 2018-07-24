import * as Rx from 'rx';
import {logger} from '../tools/logger';
import { EventContext, Router, ObservationStage, EventEnvelope } from 'esp-js';

interface EventStreamData<TStore, TEvent> extends EventEnvelope<TEvent, any> {
    readonly store: TStore;
}
type OutputSignal = { readonly isCancel?: boolean; readonly context: EventContext; };
type OutputPayload<T> = { readonly eventType: string; readonly event?: T; readonly broadcast?: boolean };

export type EventOutput<T> = OutputPayload<T> | OutputSignal;
export type EventStreamFactory<TStore, TEvent = any> = (eventName: string | string[], observationStage?: string) => Rx.Observable<EventStreamData<TStore, TEvent>>;
export type EventStreamObservable<TStore> = (factory: EventStreamFactory<TStore>) => Rx.Observable<EventOutput<any>>;

const createEventStreamFactory = <TStore>(router: Router, modelId: string, store: TStore) =>
    (eventName: string | string[], stage: string = ObservationStage.committed): Rx.Observable<EventStreamData<TStore, any>> => {
        return Rx.Observable.create(obs => {
            const events = typeof eventName === 'string'
                ? new Set(eventName)
                : new Set(eventName);

            const stream = router.getAllEventsObservable()
                .filter(envelope => envelope.observationStage === stage)
                .filter(envelope => events.has(envelope.eventType))
                .map<EventStreamData<TStore, any>>(payload => ({
                    ...payload,
                    store
                }));

            return stream.subscribe(
                payload => {
                    logger.debug('Received esp-js payload. Passing the payload onto the polimer observables.', payload);
                    obs.onNext(payload);
                },
                () => obs.onCompleted()
            );
        });
    };

export const eventStreamFactory = <TStore>(router: Router, modelId: string, store: TStore, eventStreamObs: EventStreamObservable<TStore>) => {
    logger.debug(`Creating eventStream for modelId=${modelId}`);

    const disposable = new Rx.CompositeDisposable();
    const streamFactory: EventStreamFactory<TStore> = createEventStreamFactory(router, modelId, store);

    logger.debug(`Subscribed to esp-js router with modelId=${modelId}`)
    disposable.add(
        eventStreamObs(streamFactory)
            .filter(output => output != null)
            .subscribe(
                output => {
                    if (isOutputSignal(output)) {
                        processOutputSignal(output);
                    } else {
                        processOutputPayload(router, modelId, output);
                    }
                }
            )
    );

    return disposable;
};

export const collectEventStreamObservables = <TStore>(...observables: EventStreamObservable<TStore>[]): EventStreamObservable<TStore> => {
    return (factory: EventStreamFactory<TStore>) => {
        return Rx.Observable.merge(
            observables.map((obs: EventStreamObservable<TStore>) => obs(factory))
        );
    };
};

const isOutputSignal = (output: EventOutput<any>): output is OutputSignal => {
    return output.hasOwnProperty('context');
};

const processOutputSignal = (output: OutputSignal) => {
    if (output.isCancel) {
        output.context.cancel();
    }
};

const processOutputPayload = (router: Router, modelId: string, output: OutputPayload<any>) => {
    if (output.broadcast) {
        logger.debug('Received a broadcast event from observable. Dispatching to esp-js router.', output);
        router.broadcastEvent(output.eventType, output.event || {});
    } else {
        logger.debug('Received an event from observable. Dispatching to esp-js router.', output);
        router.publishEvent(modelId, output.eventType, output.event || {});
    }
};
