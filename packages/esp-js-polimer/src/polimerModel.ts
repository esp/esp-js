import {MULTIPLE_EVENTS_DELIMITER, PolimerEventHandler, PolimerHandlerMap} from './stateEventHandlers';
import {connect, sendUpdateToDevTools} from './reduxDevToolsConnector';
import {DisposableBase, EspDecoratorUtil, EventEnvelope, EventObservationMetadata, Guard, ObservationStage, observeEvent, PolimerEventPredicate, Router} from 'esp-js';
import {InputEvent, OutputEvent, OutputEventStreamFactory} from './eventTransformations';
import {logger} from './logger';
import * as Rx from 'rx';
import {ImmutableModel} from './immutableModel';
import {PolimerEvents} from './polimerEvents';
import produce from 'immer';
import {StateHandlerModel} from './stateHandlerModel';
import {ModelPostEventProcessor, ModelPreEventProcessor} from './eventProcessors';

export interface PolimerModelSetup<TModel extends ImmutableModel> {
    initialModel: TModel;
    stateHandlerMaps: Map<string, PolimerHandlerMap<any, TModel>>;
    stateHandlerObjects: Map<string, any[]>;
    stateHandlerModels: Map<string, StateHandlerModelMetadata>;
    eventStreamFactories: OutputEventStreamFactory<TModel, any, any>[];
    eventStreamHandlerObjects: any[];
    modelPreEventProcessor: ModelPreEventProcessor<TModel>;
    modelPostEventProcessor: ModelPostEventProcessor<TModel>;
    stateSaveHandler: (model: TModel) => any;
}

export interface StateHandlerModelMetadata {
    model: StateHandlerModel<any>;
    autoWireUpObservers: boolean;
}

interface EventHandlerMetadata {
    stateName: string;
    observationStage: ObservationStage;
    predicate: PolimerEventPredicate;
    handler: PolimerEventHandler<any, any, any>;
}

interface ModelHandlerMetadata<TModel> {
    stateName: string;
    model: StateHandlerModel<TModel>;
}

export class PolimerModel<TModel extends ImmutableModel> extends DisposableBase {
    private readonly _eventHandlersByEventName: Map<string, EventHandlerMetadata[]> = new Map();
    private readonly _modelEventHandlersByEventName: Map<string, ModelHandlerMetadata<TModel>[]> = new Map();
    private _immutableModel: TModel;
    private _modelPreEventProcessor: ModelPreEventProcessor<TModel>;
    private _modelPostEventProcessor: ModelPostEventProcessor<TModel>;
    private readonly _modelId: string;

    constructor(
        private readonly _router: Router,
        private readonly _initialSetup: PolimerModelSetup<TModel>
    ) {
        super();
        Guard.isDefined(_router, 'router must be defined');
        Guard.isDefined(_initialSetup, 'initialSetup must be defined');
        Guard.isObject(_initialSetup.initialModel, 'initialModel must be defined');
        Guard.stringIsNotEmpty(_initialSetup.initialModel.modelId, `modelId must not be null or empty`);
        this._modelId = this._initialSetup.initialModel.modelId;
        this._immutableModel = this._initialSetup.initialModel;
        if (this._initialSetup.modelPreEventProcessor) {
            Guard.isFunction(this._initialSetup.modelPreEventProcessor, 'The modelPreEventProcessor is not a function');
            this._modelPreEventProcessor = this._initialSetup.modelPreEventProcessor;
        }
        if (this._initialSetup.modelPostEventProcessor) {
            Guard.isFunction(this._initialSetup.modelPostEventProcessor, 'The modelPostEventProcessor is not a function');
            this._modelPostEventProcessor = this._initialSetup.modelPostEventProcessor;
        }
    }

    public get modelId() {
        return this._modelId;
    }

    public initialize = () => {
        connect(this._router, this._modelId, this, this._modelId);
        sendUpdateToDevTools('@@INIT', this._immutableModel, this._modelId);
        this._wireUpStateHandlerModels();
        this._wireUpStateHandlerObjects();
        this._wireUpStateHandlersMaps();
        this._wireUpEventTransforms();
        this._listenToAllEvents();
        this.addDisposable(this._router.observeEventsOn(this._modelId, this));
    };

    preProcess() {
        if (this._modelPreEventProcessor) {
            let newModel = this._modelPreEventProcessor(this._immutableModel);
            // has the model been replaced by the processor?
            if (newModel) {
                this._immutableModel = newModel;
            }
        }
        this._initialSetup.stateHandlerModels.forEach((metadata: StateHandlerModelMetadata, stateName: keyof TModel) => {
            if(metadata.model.preProcess) {
                metadata.model.preProcess(metadata.model);
                this._immutableModel[stateName] = metadata.model.getEspPolimerState();
            }
        });
    }

    postProcess(eventsProcessed: string[]) {
        if (this._modelPostEventProcessor) {
            let newModel = this._modelPostEventProcessor(this._immutableModel, eventsProcessed);
            // has the model been replaced by the processor?
            if (newModel) {
                this._immutableModel = newModel;
            }
        }
        this._initialSetup.stateHandlerModels.forEach((metadata: StateHandlerModelMetadata, stateName: keyof TModel) => {
            if(metadata.model.postProcess) {
                metadata.model.postProcess(metadata.model, eventsProcessed);
                this._immutableModel[stateName] = metadata.model.getEspPolimerState();
            }
        });
    }

    /**
     * This is a hook to provide interop with esp-js-ui.
     * Polimer doesn't have a hard dependency on esp-js-ui, however if your models are created using esp-js-ui then this hook will be used to save state.
     *
     * */
    getEspUiModelState(): any {
        if (!this._initialSetup.stateSaveHandler) {
            return null;
        }
        return this._initialSetup.stateSaveHandler(this._immutableModel);
    }

    /**
     * A convention based function used by esp-js-react to select another model passed to a view connected via ConnectableComponent.
     */
    getEspReactRenderModel() {
        return this.getImmutableModel();
    }

    // called by the router when it's finished dispatching an event
    public eventDispatched(eventType: string, event: any, stage: ObservationStage) {
        if (stage !== ObservationStage.final) {
            return;
        }
        let handlers = this._modelEventHandlersByEventName.get(eventType);
        if (handlers) {
            handlers.forEach((modelHandlerMetadata: ModelHandlerMetadata<TModel>) => {
                // Given an event processed by the model in question has just finished, we replace the relevant state on the immutable model
                (<any>this._immutableModel[modelHandlerMetadata.stateName]) = modelHandlerMetadata.model.getEspPolimerState();
            });
            sendUpdateToDevTools({eventType: eventType, event: event}, this._immutableModel, this._modelId);
        }
    }

    @observeEvent(PolimerEvents.disposeModel)
    public dispose() {
        logger.debug(`Disposing PolimerModel<> ${this._modelId}`);
        this._router.removeModel(this.modelId);
        super.dispose();
    }

    private _listenToAllEvents() {
        let eventsToObserve = Array.from(this._eventHandlersByEventName.keys());
        if (eventsToObserve.length === 0) {
            return;
        }
        this.addDisposable(
            this._router.getAllEventsObservable(eventsToObserve, ObservationStage.all)
                .filter(eventEnvelope => (eventEnvelope.modelId === this._modelId))
                .subscribe((eventEnvelope: EventEnvelope<any, any>) => {
                    const eventReceivers = this._eventHandlersByEventName.get(eventEnvelope.eventType);
                    const model = <any>this._immutableModel;
                    eventReceivers.forEach((handlerMetadata: EventHandlerMetadata) => {
                        if (handlerMetadata.observationStage === eventEnvelope.observationStage) {
                            const beforeState = model[handlerMetadata.stateName];
                            let processEvent = true;
                            if (handlerMetadata.predicate) {
                                let notYetCanceled = eventEnvelope.context.isCanceled === false;
                                let notYetCommitted = eventEnvelope.context.isCommitted === false;
                                processEvent = handlerMetadata.predicate(beforeState, eventEnvelope.event, model, eventEnvelope.context);
                                if (notYetCanceled && eventEnvelope.context.isCanceled) {
                                    throw new Error('You can\'t cancel an event in an event filter/predicate. Event: [' + eventEnvelope.eventType + '], ModelId: [' + eventEnvelope.modelId + ']');
                                }
                                if (notYetCommitted && eventEnvelope.context.isCommitted) {
                                    throw new Error('You can\'t commit an event in an event filter/predicate. Event: [' + eventEnvelope.eventType + '], ModelId: [' + eventEnvelope.modelId + ']');
                                }
                            }
                            if (processEvent) {
                                logger.verbose(`State [${handlerMetadata.stateName}], eventType [${eventEnvelope.eventType}]: invoking a reducer. Before state logged to console.`, beforeState);
                                const afterState = handlerMetadata.handler(beforeState, eventEnvelope.event, model, eventEnvelope.context);
                                logger.verbose(`State [${handlerMetadata.stateName}], eventType [${eventEnvelope.eventType}]: reducer invoked. After state logged to console.`, afterState);
                                model[handlerMetadata.stateName] = afterState;
                            } else {
                                logger.verbose(`Received "${eventEnvelope.eventType}" for "${handlerMetadata.stateName}" state, skipping as the handlers predicate returned false`, beforeState);
                            }
                        }
                    });
                    if (ObservationStage.isFinal(eventEnvelope.observationStage)) {
                        sendUpdateToDevTools(eventEnvelope, this._immutableModel, this._modelId);
                    }
                })
        );
    }

    private _wireUpStateHandlerModels() {
        this._initialSetup.stateHandlerModels.forEach((metadata: StateHandlerModelMetadata, stateName: string) => {
            if (metadata.autoWireUpObservers) {
                this.addDisposable(this._router.observeEventsOn(this._modelId, metadata.model));
            }
            let events: EventObservationMetadata[] = EspDecoratorUtil.getAllEvents(metadata.model);
            events.forEach((eventObservationMetadata: EventObservationMetadata) => {
                let modelEventHandlers = this._modelEventHandlersByEventName.get(eventObservationMetadata.eventType);
                if (!modelEventHandlers) {
                    modelEventHandlers = [];
                    this._modelEventHandlersByEventName.set(eventObservationMetadata.eventType, modelEventHandlers);
                }
                modelEventHandlers.push({stateName: stateName, model: metadata.model});
            });
        });
    }

    private _wireUpStateHandlerObjects() {
        if (!this._initialSetup.stateHandlerObjects) {
            return;
        }
        this._initialSetup.stateHandlerObjects.forEach((objectsToScanForHandlers: any[], stateName) => {
            objectsToScanForHandlers.forEach(objectToScanForHandlers => {
                // create a new handler map which has the eventType as the key
                // we could just omit the decorator and just use function names, but there can be more than one decorators on a function
                let events: EventObservationMetadata[] = EspDecoratorUtil.getAllEvents(objectToScanForHandlers);
                events.forEach((decoratorMetadata: EventObservationMetadata) => {
                    const handler = objectToScanForHandlers[decoratorMetadata.functionName].bind(objectToScanForHandlers);
                    this._addEventHandlerMetadata(decoratorMetadata.eventType, stateName, <PolimerEventPredicate>decoratorMetadata.predicate, decoratorMetadata.observationStage, handler);
                });
            });
        });
    }

    private _wireUpStateHandlersMaps = () => {
        this._initialSetup.stateHandlerMaps.forEach((handlerMap: PolimerHandlerMap<any, TModel>, stateName) => {
            handlerMap = this._expandMultipleEventsIntoSeparateHandlers(handlerMap);
            Object.keys(handlerMap).forEach((eventType: string) => {
                this._addEventHandlerMetadata(eventType, stateName, null, ObservationStage.normal, handlerMap[eventType]);
            });
        });
    };

    private _addEventHandlerMetadata(eventType: string, stateName: string, predicate: PolimerEventPredicate, observationStage: ObservationStage, handler: PolimerEventHandler<any, any, any>) {
        let eventHandlerMetadataArray = this._eventHandlersByEventName.get(eventType);
        if (!eventHandlerMetadataArray) {
            eventHandlerMetadataArray = [];
            this._eventHandlersByEventName.set(eventType, eventHandlerMetadataArray);
        }
        eventHandlerMetadataArray.push(
            <EventHandlerMetadata>{
                stateName: stateName,
                predicate:  predicate,
                observationStage: observationStage,
                // A note on the produce() overload we use, from https://github.com/mweststrate/immer:
                //
                // Passing a function as the first argument to produce is intended to be used for currying.
                // This means that you get a pre-bound producer that only needs a state to produce the value from.
                // The producer function gets passed in the draft, and any further arguments that were passed to the curried function.
                handler: produce(handler)
        });
    }

    private _wireUpEventTransforms = () => {
        // There are 2 APIs for event transformations:
        // 1) Via functions that take a event stream factory, these factories take an eventType and return an `Rx.Observable<InputEvent<>>`
        //    The handlers effectively transform the `InputEvent<>`s to `OutputEvent<>` which get dispatched back into the router
        // 2) Via decorators on class functions.
        //    These are functionally similar to the first method, the difference being then don't take an event stream factory,
        //    Rather they decorate functions on an object instance which will do the event transformation.
        //    This second approach allows for dependency injection as the handling objects are effectively containers for event transformational streams
        //
        // We can normalise these down to a single observable as they are effectively the same:
        // i.e. `InputEvent<>`s to `OutputEvent<>` transformation streams.

        const observables = [];

        // First deal with the first type
        observables.push(
            ...this._initialSetup.eventStreamFactories.map(outputEventStreamFactory => outputEventStreamFactory(this._observeEvent))
        );

        // next with second type
        this._initialSetup.eventStreamHandlerObjects.forEach(objectToScanForObservables => {
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
                    (outputEvent: OutputEvent<any>) => {
                        if (outputEvent.broadcast) {
                            logger.verbose('Received a broadcast event from observable. Dispatching to esp-js router.', outputEvent);
                            this._router.broadcastEvent(outputEvent.eventType, outputEvent.event || {});
                        } else {
                            const targetModelId = outputEvent.modelId || this._modelId;
                            logger.verbose(`Received eventType ${outputEvent.eventType} for model ${targetModelId}. Dispatching to esp-js router.`, outputEvent);
                            this._router.publishEvent(targetModelId, outputEvent.eventType, outputEvent.event);
                        }
                    },
                    (err) => {
                        logger.error(`Error on observable stream for model ${this.modelId}.`, err);
                    }
                )
        );
    };

    private _observeEvent = (eventType: string | string[], observationStage: ObservationStage = ObservationStage.final): Rx.Observable<InputEvent<TModel, any>> => {
        return Rx.Observable.create((obs: Rx.Observer<any>) => {
                const events = typeof eventType === 'string' ? [eventType] : eventType;
                const espEventStreamSubscription = this._router
                    .getAllEventsObservable(events, observationStage)
                    .filter(eventEnvelope => eventEnvelope.modelId === this._modelId)
                    .subscribe(
                        (eventEnvelope: EventEnvelope<any, PolimerModel<TModel>>) => {
                            logger.verbose(`Passing event [${eventEnvelope.eventType}] at stage [${eventEnvelope.observationStage}] for model [${eventEnvelope.modelId}] to event transform stream.`);
                            let inputEvent: InputEvent<TModel, any> = this._mapEventEnvelopToInputEvent(eventEnvelope);
                            // Pass the event off to our polimer observable stream.
                            // In theory, these streams must never error.
                            // They need to bake in their own exception handling.
                            // We wrap in a try catch just to stop any exception bubbling to the router
                            try {
                                obs.onNext(inputEvent);
                            } catch (err) {
                                logger.error(`Error caught on event observable stream for event ${eventType}.`, err);
                                throw err;
                            }
                        },
                        () => obs.onCompleted()
                    );
                return espEventStreamSubscription;
            }
        );
    };

    private _mapEventEnvelopToInputEvent(eventEnvelope: EventEnvelope<any, PolimerModel<TModel>>): InputEvent<TModel, any> {
        return {
            event: eventEnvelope.event,
            eventType: eventEnvelope.eventType,
            context: eventEnvelope.context,
            model: eventEnvelope.model.getImmutableModel()
        };
    }

    /**
     * This method takes handlerMap and normalizes it producing a new handlerMap.
     * Process of normalizing includes:
     *   - split handler that listens on handler of events to two different handlers
     *
     * @param {PolimerHandlerMap<TState, TModel>} handlerMap
     * @returns {PolimerHandlerMap<TState, TModel>}
     */
    private _expandMultipleEventsIntoSeparateHandlers = <TState>(handlerMap: PolimerHandlerMap<TState, TModel>): PolimerHandlerMap<TState, TModel> => {
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

    public getImmutableModel = (): TModel => {
        return this._immutableModel;
    };

    public setImmutableModel = (value: TModel) => {
        this._immutableModel = value;
    };
}

export namespace PolimerModel {
    export const isPolimerModel = (obj: any): obj is PolimerModel<any> => {
        return 'getImmutableModel' in obj;
    };
}