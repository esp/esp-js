export interface GetEspReactRenderModelMetadata {
    functionName: string;
}
export declare namespace GetEspReactRenderModelConsts {
    const CustomDataKey = "GetEspReactRenderModelCustomDataKey";
    /**
     * If there is no @getEspReactRenderModel decorator and a function by this name exists on a model, then it will be invoked to identify the sub model which will replaced the `model` prop passed to the child view of a ConnectableComponent
     */
    const HandlerFunctionName = "getEspReactRenderModel";
}
/**
 * A decorator which can be used to identify the render model which will replaced the `model` prop passed to the child view of a ConnectableComponent
 */
export declare function getEspReactRenderModel(): (target: any, name: any, descriptor: any) => any;
