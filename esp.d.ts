// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end


export function observeEvent(eventName:String, observationStage?:string): any;

export class Router {
    addModel<T>(modelId:String, model:T, options? : any) : void;
    removeModel(modelId:String) : void;
    publishEvent(modelId:String, eventType:String, event:any) : void;
    broadcastEvent(eventType:String, event:any)  : void;
    executeEvent(eventType:String, event:any)  : void;
    runAction(modelId:String, action:() => void) : void;
    runAction<T>(modelId:String, action:(model : T) => void)  : void;
    getEventObservable<T, TEvent, TContext>(modelId:String, eventType:String, observationStage?: string) : EventObservable<T, TEvent, TContext>;
    getModelObservable<T>(modelId:String) : ModelObservable<T>;
    createModelRouter<T>(targetModelId:String) : SingleModelRouter<T>;
    addOnErrorHandler(handler : (e : Error) => void) : void;
    removeOnErrorHandler(handler : (e : Error) => void) : void;
    getDispatchLoopDiagnostics() : String
    enableDiagnostics() : void;
    disableDiagnostics() : void;
    observeEventsOn(object : any, methodPrefix?: String) : Disposable;
}

export class SingleModelRouter<T> {
    static create<TModel>() : SingleModelRouter<TModel>;
    static createWithModel<TModel>(model : TModel) : SingleModelRouter<TModel>;
    static createWithRouter<TModel>(underlyingRouter : Router, modelId : String) : SingleModelRouter<TModel>;

    setModel(model : T) : void;
    publishEvent(eventType : String, event : any) : void;
    executeEvent(eventType : String, event : any) : void;
    runAction(action : () => void) : void;
    runAction(action : (model : T) => void) : void;

    getEventObservable<TEvent, TContext>(eventType : String, observationStage? : string) : EventObservable<T, TEvent, TContext>;
    getModelObservable<T>() : ModelObservable<T>;
    observeEventsOn(object : any, methodPrefix?: String) : Disposable;
}

export interface Disposable {
    dispose():void;
}

export interface EventObserver<TModel, TEvent, TContext> {
    onNext(event: TEvent, context : TContext, model : TModel) : void;
    onCompleted() : void;
}

export interface EventObservable<TModel, TEvent, TContext> {
    observe(observer : EventObserver<TModel, TEvent, TContext>) : Disposable;
    observe(onNext : (event : TEvent, context : TContext, model : TModel) => void, onCompleted? : () => void) : Disposable;
}

export interface ModelObserver<T> {
    onNext(model : T) : void;
    onCompleted() : void;
}

export interface ModelObservable<T> {
    observe(observer : ModelObserver<T>) : Disposable;
    observe(onNext : (model : T) => void, onCompleted? : () => void) : Disposable;
}
