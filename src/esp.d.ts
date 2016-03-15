declare module esp {

    function observeEvent(eventName:String, observationStage?:string): any;

    class Router {
        addModel<T>(modelId:String, model:T, options) : void;
        removeModel(modelId:String) : void;
        publishEvent(modelId:String, eventType:String, event:any) : void;
        broadcastEvent(eventType:String, event:any)  : void;
        executeEvent(eventType:String, event:any)  : void;
        runAction(modelId:String, action:() => void)  : void;
        getEventObservable<T>(modelId:String, eventType:String, stage?: string) : EventObservable<T>;
        getModelObservable<T>(modelId:String) : ModelObservable<T>;
        createModelRouter<T>(targetModelId:String) : SingleModelRouter<T>;
        addOnErrorHandler(handler : (e : Error) => void) : void;
        removeOnErrorHandler(handler : (e : Error) => void) : void;
        getDispatchLoopDiagnostics() : String
        enableDiagnostics() : void;
        disableDiagnostics() : void;
        observeEventsOn(object : any, methodPrefix?: String) : void;
    }

    class SingleModelRouter<T> {
        static create<TModel>() : SingleModelRouter<TModel>;
        static createWithModel<TModel>(model : TModel) : SingleModelRouter<TModel>;
        static createWithRouter<TModel>(underlyingRouter : Router, modelId : String) : SingleModelRouter<TModel>;

        setModel(model : T) : void;
        publishEvent(eventType : String, event : any) : void;
        executeEvent(eventType : String, event : any) : void;
        runAction(action : () => void) : void;
        getEventObservable(eventType : String, stage? : string) : EventObservable<T>;
        getModelObservable<T>() : ModelObservable<T>;
        observeEventsOn(object : any, methodPrefix?: String) : void;
    }

    interface Disposable {
        dispose():void;
    }

    interface EventObserver<T> {
        onNext(event: any, context : any, model : T) : void;
        onCompleted() : void;
    }

    interface EventObservable<T> {
        observe(observer : EventObserver<T>) : Disposable;
        observe(onNext : (event : any, context : any, model : T) => void, onCompleted : () => void) : Disposable;
    }

    interface ModelObserver<T> {
        onNext(model : T) : void;
        onCompleted() : void;
    }

    interface ModelObservable<T> {
        observe(observer : ModelObserver<T>) : Disposable;
        observe(onNext : (model : T) => void, onCompleted : () => void) : Disposable;
    }

}

declare module 'esp-js' {
    export default esp;
}
