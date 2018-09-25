import {eventHandlerFactory, MULTIPLE_EVENTS_DELIMITER, PolimerEventHandler, PolimerHandlerMap} from './eventHandlers';
import {connect, sendUpdateToDevTools} from './reduxDevToolsConnector';
import { EventEnvelope, Router, DisposableBase, Guard, ObservationStage } from 'esp-js';
import {OutputEventStreamFactory, InputEvent, OutputEvent} from './eventStreamObservable';
import {applyImmerToHandlers} from './immerUtils';
import {logger} from './logger';
import * as Rx from 'rx';
import {Store} from './store';

export class PolimerModel<TStore extends Store> extends DisposableBase {
    private _polimerEventHandlers: { [eventType: string]: PolimerEventHandler<any, any>[]; } = {};

    constructor(
        private readonly _router: Router,
        private _store: TStore,
        private readonly _storeName: string,
        private readonly _stateHandlerMaps: Map<string, PolimerHandlerMap<any, TStore>>,
        private readonly _outputEventStreamFactories: OutputEventStreamFactory<TStore, any, any>[]
    ) {
        super();
        Guard.isDefined(_router, 'router must be defined');
        Guard.isObject(_store, 'store must be defined and be an object');
        Guard.isDefined(_stateHandlerMaps, '_stateHandlerMaps must be defined');
        Guard.isTruthy(_stateHandlerMaps.size > 0, '_stateHandlerMaps must have items');
        Guard.isTruthy(_outputEventStreamFactories.length > 0, '_stateHandlerMaps must have items');
        Guard.stringIsNotEmpty(_storeName, `storeName can not be empty and must be a string`);
    }

    public get modelId() {
        return this._store.modelId;
    }

    public initialize = () => {
        connect(this._router, this._store.modelId, this, this._storeName);
        sendUpdateToDevTools('@@INIT', this.getStore(), this._storeName);
        this._wireUpStateHandlers();
        this._wireUpObservables();
    };

    private _wireUpStateHandlers = () => {
        this._stateHandlerMaps.forEach((handlerMap, stateName) => {
            handlerMap = this._expandMultipleEventsIntoSeparateHandlers(handlerMap);
            handlerMap = applyImmerToHandlers(handlerMap);
            const polimerEventHandler = eventHandlerFactory(handlerMap, stateName);
            const events = Object.keys(handlerMap);
            this._addEventHandlers(polimerEventHandler, events);
            logger.debug(`Creating polimer state "${stateName}" listening on the following events:`, events);
        });
        let eventsToObserve = Object.keys(this._polimerEventHandlers);
        this.addDisposable(
            this._router.getAllEventsObservable(eventsToObserve)
                .filter(eventEnvelope => (eventEnvelope.modelId === this._store.modelId))
                .subscribe((eventEnvelope: EventEnvelope<any, any>) => {
                    const handlers = this._polimerEventHandlers[eventEnvelope.eventType];
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

    private _addEventHandlers = (handler: PolimerEventHandler<any, any>, events: string[]) => {
        events.forEach(event => {
            if (!(event in this._polimerEventHandlers)) {
                this._polimerEventHandlers[event] = [];
            }

            this._polimerEventHandlers[event].push(handler);
        });
    };

    private _wireUpObservables = () => {
        const eventTransformationObservables = Rx.Observable.merge(
            this._outputEventStreamFactories.map(outputEventStreamFactory => outputEventStreamFactory(this._observeEvent))
        );
        this.addDisposable(
            eventTransformationObservables
                .filter(output => output != null)
                .subscribe(
                    (output: OutputEvent<any>) => {
                        if (output.broadcast) {
                            logger.debug('Received a broadcast event from observable. Dispatching to esp-js router.', output);
                            this._router.broadcastEvent(output.eventType, output.event || {});
                        } else {
                            const targetModelId = output.modelId || this._store.modelId;
                            logger.debug(`Received eventType ${output.eventType} for model ${targetModelId}. Dispatching to esp-js router.`, output);
                            this._router.publishEvent(targetModelId, output.eventType, output.event);
                        }
                    }
                )
        );
    };

    private _observeEvent = (eventType: string | string[], stage: ObservationStage = ObservationStage.committed): Rx.Observable<InputEvent<any, TStore>> => {
        return Rx.Observable.create((obs: Rx.Observer<any>) => {
                const events = typeof eventType === 'string' ? [eventType] : eventType;
                const espEventStreamSubscription = this._router
                    .getAllEventsObservable(events, stage)
                    .filter(eventEnvelope => eventEnvelope.modelId === this._store.modelId)
                    .map<InputEvent<any, TStore>>((eventEnvelope: EventEnvelope<any, PolimerModel<TStore>>) => {
                        return {
                            event: eventEnvelope.event,
                            eventType: eventEnvelope.eventType,
                            context: eventEnvelope.context,
                            store: eventEnvelope.model.getState()
                        };
                    })
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
    }
}