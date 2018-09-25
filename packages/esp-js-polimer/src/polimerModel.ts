import {eventHandlerFactory, MULTIPLE_EVENTS_DELIMITER, PolimerEventHandler, PolimerHandlerMap} from './eventHandlers';
import {connect, sendUpdateToDevTools} from './reduxDevToolsConnector';
import {EventEnvelope, Router, DisposableBase, Guard, ObservationStage, EspDecoratorUtil, EventObservationMetadata} from 'esp-js';
import {OutputEventStreamFactory, InputEvent, OutputEvent} from './eventStreamObservable';
import {applyImmerToHandlers} from './immerUtils';
import {logger} from './logger';
import * as Rx from 'rx';
import {Store} from './store';

export class PolimerModel<TStore extends Store> extends DisposableBase {
    private _stateEventHandlers: Map<string, PolimerEventHandler<any, any>[]> = new Map();

    constructor(
        private readonly _router: Router,
        private _store: TStore,
        private readonly _storeName: string,
        private readonly _stateHandlerMaps: Map<string, PolimerHandlerMap<any, TStore>>,
        private readonly _stateHandlerObjects: Map<string, any>,
        private readonly _outputEventStreamFactories: OutputEventStreamFactory<TStore, any, any>[],
        private readonly _eventStreamHandlerObjects: any[]
    ) {
        super();
        Guard.isDefined(_router, 'router must be defined');
        Guard.isObject(_store, 'store must be defined and be an object');
        Guard.stringIsNotEmpty(_storeName, `storeName can not be empty and must be a string`);
    }

    public get modelId() {
        return this._store.modelId;
    }

    public initialize = () => {
        connect(this._router, this._store.modelId, this, this._storeName);
        sendUpdateToDevTools('@@INIT', this.getStore(), this._storeName);
        this._wireUpStateHandlers();
        // There are 2 APIs for event transformations:
        // a) Via functions that take a event stream factory, these factories procure `InputEvent<>`s
        //    These are late bound, we don't know when the event factor will be called, it's not deterministic
        // b) Via decorators on class functions which take `InputEvent<>`s directly
        //    We know these event types here, it's deterministic
        this._wireUpLateBoundEventStreams();
        this._wireUpDecoratedEventStreams();
    };

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
            logger.debug(`Creating polimer state "${stateName}" listening on the following events:`, events);
        });
        let eventsToObserve = Array.from(this._stateEventHandlers.keys());
        this.addDisposable(
            this._router.getAllEventsObservable(eventsToObserve)
                .filter(eventEnvelope => (eventEnvelope.modelId === this._store.modelId))
                .subscribe((eventEnvelope: EventEnvelope<any, any>) => {
                        const handlers = this._stateEventHandlers.get(eventEnvelope.eventType);
                        handlers.forEach(handler => handler(eventEnvelope.eventType, eventEnvelope.event, this._store));
                        sendUpdateToDevTools(eventEnvelope, this.getStore(), this._storeName);
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
                handlerMap[metadata.eventType] = objectToScanForHandlers[metadata.functionName];
            });
            this._stateHandlerMaps.set(stateName, handlerMap);
        });
    }

    private _wireUpLateBoundEventStreams = () => {
        const lateBoundEventTransformationStreams = Rx.Observable.merge(
            this._outputEventStreamFactories.map(outputEventStreamFactory => outputEventStreamFactory(this._observeEvent))
        );
        this.addDisposable(
            lateBoundEventTransformationStreams
                .filter(output => output != null)
                .subscribe((output: OutputEvent<any>) => this._processOutputEvent(output))
        );
    };

    private _wireUpDecoratedEventStreams() {
        let observables = [];
        this._eventStreamHandlerObjects.forEach(objectToScanForObservables => {
            let events: EventObservationMetadata[] = EspDecoratorUtil.getAllEvents(objectToScanForObservables);
            events.forEach(metadata => {
                observables.push(
                    this._observeEvent(metadata.eventType, metadata.observationStage)
                        .flatMap(inputEvent => objectToScanForObservables[metadata.functionName](inputEvent))
                );
            });
        });
        this.addDisposable(
            Rx.Observable.merge(...observables)
                .filter(output => output != null)
                .subscribe((output: OutputEvent<any>) => this._processOutputEvent(output))
        );
    }

    private _observeEvent = (eventType: string | string[], stage: ObservationStage = ObservationStage.committed): Rx.Observable<InputEvent<any, TStore>> => {
        return Rx.Observable.create((obs: Rx.Observer<any>) => {
                const events = typeof eventType === 'string' ? [eventType] : eventType;
                const espEventStreamSubscription = this._router
                    .getAllEventsObservable(events, stage)
                    .filter(eventEnvelope => eventEnvelope.modelId === this._store.modelId)
                    .map<InputEvent<any, TStore>>((eventEnvelope: EventEnvelope<any, PolimerModel<TStore>>) => this._mapEventEnvelopToInputEvent(eventEnvelope))
                    .subscribe(
                        inputEvent => {
                            logger.debug('Received esp-js payload. Passing the payload onto the polimer observables.', inputEvent);
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

    private _processOutputEvent = (output: OutputEvent<any>) => {
        if (output.broadcast) {
            logger.debug('Received a broadcast event from observable. Dispatching to esp-js router.', output);
            this._router.broadcastEvent(output.eventType, output.event || {});
        } else {
            const targetModelId = output.modelId || this._store.modelId;
            logger.debug(`Received eventType ${output.eventType} for model ${targetModelId}. Dispatching to esp-js router.`, output);
            this._router.publishEvent(targetModelId, output.eventType, output.event);
        }
    };

    private _mapEventEnvelopToInputEvent(eventEnvelope: EventEnvelope<any, PolimerModel<TStore>>): InputEvent<any, TStore> {
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