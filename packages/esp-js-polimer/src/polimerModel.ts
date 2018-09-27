import {eventHandlerFactory, MULTIPLE_EVENTS_DELIMITER, PolimerEventHandler, PolimerHandlerMap} from './eventHandlers';
import {connect, sendUpdateToDevTools} from './reduxDevToolsConnector';
import {EventEnvelope, Router, DisposableBase, Guard, ObservationStage, EspDecoratorUtil, EventObservationMetadata, observeEvent} from 'esp-js';
import {OutputEventStreamFactory, InputEvent, OutputEvent} from './eventStreamObservable';
import {applyImmerToHandlers} from './immerUtils';
import {logger} from './logger';
import * as Rx from 'rx';
import {Store} from './store';
import {PolimerEvents} from './polimerEvents';

export class PolimerModel<TStore extends Store> extends DisposableBase {
    private readonly _stateEventHandlers: Map<string, PolimerEventHandler<any, any>[]> = new Map();
    private readonly _modelId: string;

    constructor(
        private readonly _router: Router,
        private _store: TStore,
        private readonly _stateHandlerMaps: Map<string, PolimerHandlerMap<any, TStore>>,
        private readonly _stateHandlerObjects: Map<string, any>,
        private readonly _eventStreamFactories: OutputEventStreamFactory<TStore, any, any>[],
        private readonly _eventStreamHandlerObjects: any[]
    ) {
        super();
        Guard.isDefined(_router, 'router must be defined');
        Guard.isObject(_store, 'store must be defined and be an object');
        Guard.stringIsNotEmpty(_store.modelId, `Initial store's modelId must not be null or empty`);
        this._modelId = _store.modelId;
    }

    public get modelId() {
        return this._modelId;
    }

    public initialize = () => {
        connect(this._router, this._modelId, this, this._modelId);
        sendUpdateToDevTools('@@INIT', this.getStore(), this._modelId);
        this._wireUpStateHandlers();
        this._wireUpEventStreams();
        this.addDisposable(this._router.observeEventsOn(this._modelId, this));
    };

    @observeEvent(PolimerEvents.disposeModel)
    private _onDispose() {
        logger.debug(`Disposing PolimerModel<> ${this._modelId}`);
        this.dispose();
    }

    private _wireUpStateHandlers = () => {
        this._scanDecoratedObjectsForStateHandlers();

        this._stateHandlerMaps.forEach((handlerMap, stateName) => {
            handlerMap = this._expandMultipleEventsIntoSeparateHandlers(handlerMap);
            handlerMap = applyImmerToHandlers(handlerMap);
            const polimerEventHandler = eventHandlerFactory(handlerMap, stateName);
            const events = Object.keys(handlerMap);
            events.forEach(event => {
                let stateHandler = this._stateEventHandlers.get(event);
                if (!stateHandler) {
                    stateHandler = [];
                    this._stateEventHandlers.set(event, stateHandler);
                }
                stateHandler.push(polimerEventHandler);
            });
            logger.verbose(`Creating polimer state "${stateName}" listening on the following events:`, events);
        });
        let eventsToObserve = Array.from(this._stateEventHandlers.keys());
        this.addDisposable(
            this._router.getAllEventsObservable(eventsToObserve)
                .filter(eventEnvelope => (eventEnvelope.modelId === this._modelId))
                .subscribe((eventEnvelope: EventEnvelope<any, any>) => {
                        const handlers = this._stateEventHandlers.get(eventEnvelope.eventType);
                        handlers.forEach(handler => handler(eventEnvelope.eventType, eventEnvelope.event, this._store));
                        sendUpdateToDevTools(eventEnvelope, this.getStore(), this._modelId);
                        // Data mutation should happen exclusively in the above handlers (i.e. the store's state handlers).
                        // For side-effects, either pre- or post- store mutation, you can use subscribe to events at ObservationStage.Preview, or ObservationStage.committed
                        // ObservationStage.committed is the default stage for polimer observables
                        eventEnvelope.context.commit();
                    }
                )
        );
    };

    private _scanDecoratedObjectsForStateHandlers() {
        if (!this._stateHandlerObjects) {
            return;
        }
        this._stateHandlerObjects.forEach((objectToScanForHandlers, stateName) => {
            // create a new handler map which has the eventType as the key
            // we should just omit the decorator and just use function names, but there can be more than one decorators on a function
            let handlerMap: PolimerHandlerMap<any, TStore> = {};
            let events: EventObservationMetadata[] = EspDecoratorUtil.getAllEvents(objectToScanForHandlers);
            events.forEach(metadata => {
                // copy the decorated function to our new map
                handlerMap[metadata.eventType] = objectToScanForHandlers[metadata.functionName].bind(objectToScanForHandlers);
            });
            this._stateHandlerMaps.set(stateName, handlerMap);
        });
    }

    private _wireUpEventStreams = () => {
        // There are 2 APIs for event transformations:
        // 1) Via functions that take a event stream factory, these factories take an eventType and return an `Rx.Observable<InputEvent<>>`
        //    The handlers effectively transform the `InputEvent<>`s to `OutputEvent<>` which get dispatched back into the router
        // 2) Via decorators on class functions.
        //    These are functionally similar to the first method, the difference being then don't take an event stream factory,
        //    Rather then decorate functions on an object instance which will do the event transformation.
        //    This second approach allows for dependency injection as the handling objects are effectively containers for event transformational streams
        //
        // We can normalise these down to a single observable as they are effectively the same:
        // i.e. `InputEvent<>`s to `OutputEvent<>` transformation streams.

        const observables = [];

        // First deal with the first type
        observables.push(
            ...this._eventStreamFactories.map(outputEventStreamFactory => outputEventStreamFactory(this._observeEvent))
        );

        // next with second type
        this._eventStreamHandlerObjects.forEach(objectToScanForObservables => {
            const metadata: EventObservationMetadata[] = EspDecoratorUtil.getAllEvents(objectToScanForObservables);

            // group by the function name as there may be multiple events being observed by 1 function
            let metadataGroupedByFunction: { [functionName: string]: EventObservationMetadata[] } = metadata.reduce(
                (result, m) => {
                    (result[m.functionName] = result[m.functionName] || []).push(m);
                    return result;
                },
                {}
            );
            Object.keys(metadataGroupedByFunction).forEach(functionName => {
                const metadataForFunction: EventObservationMetadata[] = metadataGroupedByFunction[functionName];
                // When using decorators the function may declare multiple decorators,
                // they may use a different observation stage. Given that, we subscribe to the router separately
                // and pump the final observable into our handling function to subscribe to.
                const inputEventStream = Rx.Observable.merge(metadataForFunction.map(m => this._observeEvent(m.eventType, m.observationStage)));
                const outputEventStream = objectToScanForObservables[functionName](inputEventStream);
                observables.push(outputEventStream);
            });
        });

        // now we've normalised them as a single observable and we can kick it off
        this.addDisposable(
            Rx.Observable.merge(...observables)
                .filter(output => output != null)
                .subscribe(
                    (output: OutputEvent<any>) => {
                        if (output.broadcast) {
                            logger.verbose('Received a broadcast event from observable. Dispatching to esp-js router.', output);
                            this._router.broadcastEvent(output.eventType, output.event || {});
                        } else {
                            const targetModelId = output.modelId || this._modelId;
                            logger.verbose(`Received eventType ${output.eventType} for model ${targetModelId}. Dispatching to esp-js router.`, output);
                            this._router.publishEvent(targetModelId, output.eventType, output.event);
                        }
                    },
                    (err) => {
                        logger.error(`Error on observable stream for model ${this.modelId}.`, err);
                    }
                )
        );
    };

    private _observeEvent = (eventType: string | string[], stage: ObservationStage = ObservationStage.committed): Rx.Observable<InputEvent<TStore, any>> => {
        return Rx.Observable.create((obs: Rx.Observer<any>) => {
                const events = typeof eventType === 'string' ? [eventType] : eventType;
                const espEventStreamSubscription = this._router
                    .getAllEventsObservable(events, stage)
                    .filter(eventEnvelope => eventEnvelope.modelId === this._modelId)
                    .subscribe(
                        (eventEnvelope: EventEnvelope<any, PolimerModel<TStore>>) => {
                            logger.verbose(`Passing event [${eventEnvelope.eventType}] at stage [${eventEnvelope.observationStage}] for model [${eventEnvelope.modelId}] to eventStream.`);
                            let inputEvent: InputEvent<TStore, any> = this._mapEventEnvelopToInputEvent(eventEnvelope);
                            // Pass the event off to our polimer observable stream.
                            // In theory, these streams must never error.
                            // They need to bake in their own exception handling.
                            // We wrap in a try catch just to stop any exception bubbling to the router
                            try {
                                obs.onNext(inputEvent);
                            } catch (err) {
                                logger.error(`Error caught on event observable stream for event ${eventType}.`, err);
                            }
                        },
                        () => obs.onCompleted()
                    );
                return espEventStreamSubscription;
            }
        );
    };

    private _mapEventEnvelopToInputEvent(eventEnvelope: EventEnvelope<any, PolimerModel<TStore>>): InputEvent<TStore, any> {
        return {
            event: eventEnvelope.event,
            eventType: eventEnvelope.eventType,
            context: eventEnvelope.context,
            store: eventEnvelope.model.getState()
        };
    }

    /**
     * This method takes handlerMap and normalizes it producing a new handlerMap.
     * Process of normalizing includes:
     *   - split handler that listens on handler of events to two different handlers
     *
     * @param {PolimerHandlerMap<TState, TStore>} handlerMap
     * @returns {PolimerHandlerMap<TState, TStore>}
     */
    private _expandMultipleEventsIntoSeparateHandlers = <TState>(handlerMap: PolimerHandlerMap<TState, TStore>): PolimerHandlerMap<TState, TStore> => {
        return Object.keys(handlerMap).reduce((map, eventType) => {
            if (eventType.indexOf(MULTIPLE_EVENTS_DELIMITER) !== -1) {
                const events = eventType.split(MULTIPLE_EVENTS_DELIMITER);
                events.forEach(event => {
                    map[event] = handlerMap[eventType];
                });
            } else {
                map[eventType] = handlerMap[eventType];
            }

            return map;
        }, {});
    };

    public getStore = (): TStore => {
        return this._store;
    };

    public getState = (): TStore => {
        return this._store;
    };

    public setStore = (value: TStore) => {
        this._store = value;
    };
}