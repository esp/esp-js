import {PostEventProcessor, PreEventProcessor} from './eventProcessors';
import {ModelObserverMapper} from './modelObserverMapper';

export interface ModelOptions {
    /**
     * An optional function which if provided will be called before the router processes any events for this model
     */
    preEventProcessor?: PreEventProcessor;
    /**
     * An optional function which if provided will be called after the router processes all events on the model current dispatch loop
     */
    postEventProcessor?: PostEventProcessor;
    /**
     * An optional function which if provided will be invoked and the result dispatched via router.getModelObservable(modelId) rather than the model itself.
     * This is a hook to change the shape, or select a sub graph of the model.
     *
     * Handy if your model has more plumbing code and you only want to select specific state to dispatch to model observers
     * @param model: the model registered via router.addModel()
     */
    modelObservableMapper?: ModelObserverMapper;
}