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


export function observeEvent(eventName:string, observationStage?:string): any;

export function observeModelChangedEvent(modelId:string): any;

export class Router {
    addModel<T>(modelId:string, model:T, options? : any) : void;
    removeModel(modelId:string) : void;
    isModelRegistered(modelId:string) : boolean;
    publishEvent(modelId:string, eventType:string, event:any) : void;
    broadcastEvent(eventType:string, event:any)  : void;
    executeEvent(eventType:string, event:any)  : void;
    runAction(modelId:string, action:() => void) : void;
    runAction<T>(modelId:string, action:(model : T) => void)  : void;
    getEventObservable<T, TEvent, TContext>(modelId:string, eventType:string, observationStage?: string) : EventObservable<T, TEvent, TContext>;
    getModelObservable<T>(modelId:string) : Observable<T>;
    createObservableFor<T>(modelId : string, observer : (observer : Observer<T>) => Disposable | Function | void) : RouterObservable<T>;
    createSubject<T>() : RouterSubject<T>;
    observeEventsOn<TModel>(modelId: string, model : TModel, methodPrefix?: string) : Disposable;
    createModelRouter<T>(targetModelId:string) : SingleModelRouter<T>;
    addOnErrorHandler(handler : (e : Error) => void) : void;
    removeOnErrorHandler(handler : (e : Error) => void) : void;
    getDispatchLoopDiagnostics() : string
    enableDiagnostics() : void;
    disableDiagnostics() : void;
    isOnDispatchLoopFor(modelId) : boolean;
}

export class SingleModelRouter<T> {
    static create<TModel>() : SingleModelRouter<TModel>;
    static createWithModel<TModel>(model : TModel) : SingleModelRouter<TModel>;
    static createWithRouter<TModel>(underlyingRouter : Router, modelId : string) : SingleModelRouter<TModel>;
    setModel(model : T) : void;
    publishEvent(eventType : string, event : any) : void;
    executeEvent(eventType : string, event : any) : void;
    runAction(action : () => void) : void;
    runAction(action : (model : T) => void) : void;
    getEventObservable<TEvent, TContext>(eventType : string, observationStage? : string) : EventObservable<T, TEvent, TContext>;
    getModelObservable<T>() : Observable<T>;
    observeEventsOn<TModel>(model : TModel, methodPrefix?: string) : Disposable;
    createObservable<T>(observer : (observer : Observer<T>) => Disposable | Function | void) : RouterObservable<T>;
    createSubject<T>() : RouterSubject<T>;
    isOnDispatchLoop() : boolean;
}

export interface EventContext {
    currentStage:string;
    isCanceled:boolean;
    isCommitted:boolean;
    cancel() : void;
    commit() : void;
}

export class ObservationStage {
    static preview : string;
    static normal : string;
    static committed : string;
}

export interface Disposable {
    dispose():void;
}

export abstract class DisposableBase {
    isDisposed : boolean;
    addDisposable (disposable : Disposable);
    addDisposable (disposable : () => void) : void;
    dispose () : void;
}

export class CompositeDisposable {
    isDisposed : boolean;
    add(disposable : Disposable) : void;
    add(disposable : () => void) : void;
    dispose() : void;
}

export interface EventObserver<TModel, TEvent, TContext> {
    onNext(event: TEvent, context : TContext, model : TModel) : void;
    onCompleted() : void;
}

export interface EventObservable<TModel, TEvent, TContext> {
    subscribe(observer : EventObserver<TModel, TEvent, TContext>) : Disposable;
    subscribe(observer : (event : TEvent, context : TContext, model : TModel) => void, onCompleted? : () => void) : Disposable;
    do(observer : (event : TEvent) => void) : EventObservable<TModel, TEvent, TContext>;
    do(observer : (event : TEvent, context : TContext) => void) : EventObservable<TModel, TEvent, TContext>;
    do(observer : (event : TEvent, context : TContext, model : TModel) => void) : EventObservable<TModel, TEvent, TContext>;
    where(predicate: (event : TEvent) => boolean) : EventObservable<TModel, TEvent, TContext>;
    where(predicate: (event : TEvent, context : TContext) => boolean) : EventObservable<TModel, TEvent, TContext>;
    where(predicate: (event : TEvent, context : TContext, model : TModel) => boolean) : EventObservable<TModel, TEvent, TContext>;
    take(count:number) : EventObservable<TModel, TEvent, TContext>;
}

export interface Observer<T> {
    onNext(model : T) : void;
    onCompleted() : void;
}

export interface Observable<T> {
    subscribe() : Disposable;
    subscribe(observer : Observer<T>) : Disposable;
    subscribe(observer : (model : T) => void, onCompleted? : () => void) : Disposable;
    do(observer : (model : T) => void) : Observable<T>;
    where(predicate: (model : T) => boolean) : Observable<T>;
    map<TOther>(predicate: (model : T) => TOther) : Observable<TOther>;
    take(count:number) : Observable<T>;
}

export interface ObservableStatic {
    create<T>(observer: (observer: Observer<T>) => Disposable | Function | void): Observable<T>;
}

export var Observable: ObservableStatic;

export interface Subject<T> extends Observable<T>, Observer<T> {
    getObserverCount(): number;
}

interface SubjectStatic {
    new <T>(cacheLastValue?: boolean): Subject<T>;
}

export var Subject: SubjectStatic;

export interface RouterObservable<T> extends Observable<T> {
    streamFor(modelId:string) : RouterObservable<T>;
    subscribeOn(modelId:string) : RouterObservable<T>;
}

export interface RouterSubject<T> extends Subject<T>  {
    asRouterObservable() : RouterObservable<T>;
}

interface RouterSubjectStatic {
    new <T>(router: Router): RouterSubject<T>;
}

export class ModelChangedEvent<T> {
    modelId: string;
    model: T;
}