import {PolimerEventHandler} from './stateEventHandlers';
import {connectDevTools, sendUpdateToDevTools} from './reduxDevToolsConnector';
import {DisposableBase, EspDecoratorUtil, EventEnvelope, EventObservationMetadata, Guard, Level, ObservationStage, observeEvent, PolimerEventPredicate, Router} from 'esp-js';
import {InputEvent, OutputEvent} from './eventTransformations';
import {logger} from './logger';
import {ImmutableModel} from './immutableModel';
import {PolimerEvents} from './polimerEvents';
import produce from 'immer';
import {StateHandlerModel} from './stateHandlerModel';
import {ModelPostEventProcessor, ModelPreEventProcessor} from './eventProcessors';
import {merge, Observable, Subscriber, Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Disposable} from 'esp-js';

export interface PolimerModelConfig<TModel extends ImmutableModel> {
    initialModel: TModel;
    modelPreEventProcessor: ModelPreEventProcessor<TModel>;
    modelPostEventProcessor: ModelPostEventProcessor<TModel>;
    stateSaveHandler: (model: TModel) => any;
    stateHandlerObjects: Map<string, any[]>;
    stateHandlerModels: Map<string, StateHandlerModelMetadata>;
    eventStreamHandlerObjects: any[];
}

export interface PolimerModelConfigUpdate {
    itemsToWireUp: {
        stateHandlerObjects: Map<string, any[]>;
        stateHandlerModels: Map<string, StateHandlerModelMetadata>;
        eventStreamHandlerObjects: any[];
    };
    itemsToUnWire: {
        stateHandlerObjects: Map<string, any[]>;
        stateHandlerModels: Map<string, StateHandlerModel<any>>;
        eventStreamHandlerObjects: any[];
    };
}

export interface StateHandlerModelMetadata {
    // a non-polimer OO type model
    model: StateHandlerModel<any>;
    autoWireUpObservers: boolean;
}

interface ModelHandlerMetadata<TModel> {
    stateName: string;
    // a non-polimer OO type model
    model: StateHandlerModel<TModel>;
}

export class PolimerModel<TModel extends ImmutableModel> extends DisposableBase {
    private readonly _modelEventHandlersByEventName: Map<string, ModelHandlerMetadata<TModel>[]> = new Map();
    private _immutableModel: TModel;
    private _modelPreEventProcessor: ModelPreEventProcessor<TModel>;
    private _modelPostEventProcessor: ModelPostEventProcessor<TModel>;
    private _subscriptionsByObject: Map<object, Disposable> = new Map();

    private readonly _modelId: string;

    constructor(
        private readonly _router: Router,
        private readonly _initialConfig: PolimerModelConfig<TModel>
    ) {
        super();
        Guard.isDefined(_router, 'router must be defined');
        Guard.isDefined(_initialConfig, 'initialSetup must be defined');
        Guard.isObject(_initialConfig.initialModel, 'initialModel must be defined');
        Guard.stringIsNotEmpty(_initialConfig.initialModel.modelId, `modelId must not be null or empty`);
        this._modelId = this._initialConfig.initialModel.modelId;
        this._immutableModel = this._initialConfig.initialModel;
        if (this._initialConfig.modelPreEventProcessor) {
            Guard.isFunction(this._initialConfig.modelPreEventProcessor, 'The modelPreEventProcessor is not a function');
            this._modelPreEventProcessor = this._initialConfig.modelPreEventProcessor;
        }
        if (this._initialConfig.modelPostEventProcessor) {
            Guard.isFunction(this._initialConfig.modelPostEventProcessor, 'The modelPostEventProcessor is not a function');
            this._modelPostEventProcessor = this._initialConfig.modelPostEventProcessor;
        }
    }

    public get modelId() {
        return this._modelId;
    }

    public initialize = () => {
        connectDevTools(this._router, this._modelId, this, this._modelId);
        sendUpdateToDevTools('@@INIT', this._immutableModel, this._modelId);
        this._wireUpStateHandlerModels();
        this._wireUpStateHandlerObjects();
        this._wireUpEventTransforms();
        this.addDisposable(this._router.observeEventsOn(this._modelId, this));
    };

    public update = (config: PolimerModelConfigUpdate) => {

        throw new Error('TODO');

    };

    preProcess() {
        if (this._modelPreEventProcessor) {
            let newModel = this._modelPreEventProcessor(this._immutableModel);
            // has the model been replaced by the processor?
            if (newModel) {
                this._immutableModel = newModel;
            }
        }
        // run pre-processing for the OO/legacy type models which may be integrating with polimer models
        this._initialConfig.stateHandlerModels.forEach((metadata: StateHandlerModelMetadata, stateName: keyof TModel) => {
            if (metadata.model.preProcess) {
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
        // run post-processing for the OO/legacy type models which may be integrating with polimer models
        this._initialConfig.stateHandlerModels.forEach((metadata: StateHandlerModelMetadata, stateName: keyof TModel) => {
            if (metadata.model.postProcess) {
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
        if (!this._initialConfig.stateSaveHandler) {
            return null;
        }
        return this._initialConfig.stateSaveHandler(this._immutableModel);
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
        this._subscriptionsByObject.forEach(d => (d.dispose()));
        super.dispose();
    }

    private _wireUpStateHandlerModels() {
        this._initialConfig.stateHandlerModels.forEach((metadata: StateHandlerModelMetadata, stateName: string) => {
            if (metadata.autoWireUpObservers) {
                this.addDisposable(this._router.observeEventsOn(this._modelId, metadata.model));
            }
            let events: EventObservationMetadata[] = EspDecoratorUtil.getAllEvents(metadata.model);

            // TODO TODO keep a disposable for all streams against metadata.model

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
        if (!this._initialConfig.stateHandlerObjects) {
            return;
        }
        this._initialConfig.stateHandlerObjects.forEach((objectsToScanForHandlers: any[], stateName) => {
            objectsToScanForHandlers.forEach(objectToScanForHandlers => {
                // create a new handler map which has the eventType as the key
                // we could just omit the decorator and just use function names, but there can be more than one decorators on a function
                let events: EventObservationMetadata[] = EspDecoratorUtil.getAllEvents(objectToScanForHandlers);

                // TODO keep a disposable for all streams against objectToScanForHandlers

                events.forEach((decoratorMetadata: EventObservationMetadata) => {
                    // A note on the produce() overload we use, from https://github.com/mweststrate/immer:
                    //
                    // Passing a function as the first argument to produce is intended to be used for currying.
                    // This means that you get a pre-bound producer that only needs a state to produce the value from.
                    // The producer function gets passed in the draft, and any further arguments that were passed to the curried function.
                    const handler = produce(
                        objectToScanForHandlers[decoratorMetadata.functionName].bind(objectToScanForHandlers) as PolimerEventHandler<any, any, any> // informational only cast
                    );
                    let predicate = <PolimerEventPredicate>decoratorMetadata.predicate;
                    this.addDisposable(
                        this._router.getEventObservable(this._modelId, decoratorMetadata.eventType, decoratorMetadata.observationStage)
                            .subscribe((eventEnvelope: EventEnvelope<any, any>) => {
                                const model = <any>this._immutableModel;
                                const beforeState = model[stateName];
                                let processEvent = true;
                                if (predicate) {
                                    let notYetCanceled = eventEnvelope.context.isCanceled === false;
                                    let notYetCommitted = eventEnvelope.context.isCommitted === false;
                                    processEvent = predicate(beforeState, eventEnvelope.event, model, eventEnvelope.context);
                                    if (notYetCanceled && eventEnvelope.context.isCanceled) {
                                        throw new Error('You can\'t cancel an event in an event filter/predicate. Event: [' + eventEnvelope.eventType + '], ModelId: [' + eventEnvelope.modelId + ']');
                                    }
                                    if (notYetCommitted && eventEnvelope.context.isCommitted) {
                                        throw new Error('You can\'t commit an event in an event filter/predicate. Event: [' + eventEnvelope.eventType + '], ModelId: [' + eventEnvelope.modelId + ']');
                                    }
                                }
                                if (processEvent) {
                                    if (logger.isLevelEnabled(Level.verbose)) { logger.verbose(`State [${stateName}], eventType [${eventEnvelope.eventType}]: invoking a reducer. Before state logged to console.`, beforeState); }
                                    const afterState = handler(beforeState, eventEnvelope.event, model, eventEnvelope.context);
                                    if (logger.isLevelEnabled(Level.verbose)) { logger.verbose(`State [${stateName}], eventType [${eventEnvelope.eventType}]: reducer invoked. After state logged to console.`, afterState); }
                                    model[stateName] = afterState;
                                } else {
                                    if (logger.isLevelEnabled(Level.verbose)) { logger.verbose(`Received "${eventEnvelope.eventType}" for "${stateName}" state, skipping as the handlers predicate returned false`, beforeState); }
                                }
                            })
                    );
                });
            });
        });
    }

    private _wireUpEventTransforms = () => {
        const observables = [];

        // next with second type
        this._initialConfig.eventStreamHandlerObjects.forEach(objectToScanForObservables => {
            const metadata: EventObservationMetadata[] = EspDecoratorUtil.getAllEvents(objectToScanForObservables);

            // TODO keep a disposable for all streams against objectToScanForObservables

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
                const inputEventStream = merge(...metadataForFunction.map(m => this._observeEvent(m.eventType, m.observationStage, m.functionName)));
                const outputEventStream = objectToScanForObservables[functionName](inputEventStream);
                observables.push(outputEventStream);
            });
        });

        let subscription: Subscription = merge(...observables)
            .pipe(
                filter(output => output != null)
            )
            .subscribe(
                (outputEvent: OutputEvent<any>) => {
                    if (outputEvent.broadcast) {
                        if (logger.isLevelEnabled(Level.verbose)) { logger.verbose('Received a broadcast event from observable. Dispatching to esp-js router.', outputEvent); }
                        this._router.broadcastEvent(outputEvent.eventType, outputEvent.event || {});
                    } else {
                        const targetModelId = outputEvent.modelId || this._modelId;
                        if (logger.isLevelEnabled(Level.verbose)) { logger.verbose(`Received eventType ${outputEvent.eventType} for model ${targetModelId}. Dispatching to esp-js router.`, outputEvent); }
                        this._router.publishEvent(targetModelId, outputEvent.eventType, outputEvent.event);
                    }
                },
                (err: any) => {
                    logger.error(`Error on observable stream for model ${this.modelId}.`, err);
                }
            );
        // now we've normalised them as a single observable and we can kick it off

        // TODO keep a disposable for all streams against objectToScanForObservables

        this.addDisposable(subscription);
    };

    private _observeEvent = (eventType: string, observationStage: ObservationStage = ObservationStage.final, functionName: string = 'NA'): Observable<InputEvent<TModel, any>> => {
        return new Observable((obs: Subscriber<any>) => {
                if (logger.isLevelEnabled(Level.verbose)) { logger.verbose(`Event transform: wire-up on function [${functionName}] for event [${eventType}] at stage [${observationStage}] for model [${this._modelId}] `); }
                const espEventStreamSubscription = this._router
                    .getEventObservable(this._modelId, eventType, observationStage)
                    .subscribe(
                        (eventEnvelope: EventEnvelope<any, PolimerModel<TModel>>) => {
                            if (logger.isLevelEnabled(Level.verbose)) {logger.verbose(`Event transform: event [${eventEnvelope.eventType}] received at stage [${eventEnvelope.observationStage}] for model [${eventEnvelope.modelId}].`); }
                            let inputEvent: InputEvent<TModel, any> = this._mapEventEnvelopToInputEvent(eventEnvelope);
                            // Pass the event off to our polimer observable stream.
                            // In theory, these streams must never error.
                            // They need to bake in their own exception handling.
                            // We wrap in a try catch just to stop any exception bubbling to the router
                            try {
                                obs.next(inputEvent);
                            } catch (err) {
                                logger.error(`Error caught on event observable stream for event ${eventType}.`, err);
                                throw err;
                            }
                        },
                        () => {
                            if (logger.isLevelEnabled(Level.verbose)) { logger.verbose(`Event transform: stream for function [${functionName}] event [${eventType}] stage [${observationStage}] model [${this._modelId}] completed`); }
                            obs.complete();
                        }
                    );
                return () => {
                    espEventStreamSubscription.dispose();
                };
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