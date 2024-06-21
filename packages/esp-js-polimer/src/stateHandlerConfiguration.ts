export interface StateHandlerConfiguration {
    /**
     * An optional model path which can be useful if you want your event to be processed against a specific path on the model instance and by a specific handler instance.
     *
     * You can still use event routing without specificity this, particularly if you stateHandlers have not instance specific static data.
     *
     * This is more for a case where you need to pre-seed a state handler with instance specific data and you only want that instance handling events for the given modelPath.
     */
    modelPath?: string;
    /**
     * A handler object containing @observeEvent decorated and side effect free functions
     */
    stateHandler: object;
}

export namespace StateHandlerConfiguration {
    export const isHandlerConfiguration = (value: any): value is StateHandlerConfiguration => {
        return typeof value === 'object' && (value as StateHandlerConfiguration).stateHandler !== undefined;
    };
}