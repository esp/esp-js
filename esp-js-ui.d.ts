import * as Rx from 'rx';
import * as esp from 'esp-js';
import { Router, DisposableBase } from 'esp-js';
import { Container, Resolver } from 'microdi-js';
import * as React from 'react';

declare module 'rx' {
    export interface Observable<T> {
        retryWithPolicy<T>(
            policy: RetryPolicy,
            onError?: (err: Error) => void,
            scheduler?: Rx.IScheduler): Rx.Observable<T>;

        subscribeWithRouter<T, TModel>(
            router: esp.Router,
            modelId: string,
            onNext?: (value: T, model: TModel) => void,
            onError?: (exception: any, model: TModel) => void,
            onCompleted?: (model: TModel) => void): Rx.Disposable;

    }
}

export class RetryPolicy {
    static defaultPolicy(errorMessage: string): RetryPolicy;
    static none(): RetryPolicy;
    static createForUnlimitedRetry(description: string, retryAfterElapsedMs: number): RetryPolicy;
    constructor(description: string, retryLimit: number, retryAfterElapsedMs: number, errorMessage: string | null);

    readonly description: string;
    readonly shouldRetry: boolean;
    readonly errorMessage: string | null;
    readonly retryAfterElapsedMs: number;
    readonly retryCount: number;
    readonly retryLimit: number;
    incrementRetryCount(): void;
    reset(): void;
}

export class Decimal {
    static parse(value: any): Decimal;

    constructor(unscaledValue: number, scale);

    readonly unscaledValue: number;
    readonly scale: number;
    readonly value: number;

    format(formatter?: (decimal: Decimal) => string): string;
}

export class DecimalFormat {
    static ToString: (decimal: Decimal) => string;
    static ToLocal: (decimal: Decimal) => string;
}

export class Environment {
    static readonly isRunningOnTablet: boolean;
}

export class Guard {
    static isDefined(value: any, message: string): void;
    static isFalse(value: any, message: string): void;
    static lengthIs<T>(array: Array<T>, expectedLength: number, message: string): void;
    static lengthGreaterThan<T>(array: Array<T>, expectedLength: number, message: string): void;
    static lengthIsAtLeast<T>(array: Array<T>, expectedLength: number, message: string): void;
    static isString(value: any, message: string): void;
    static stringIsNotEmpty(value: any, message: string): void;
    static isTrue(item: any, message: string): void;
    static isFunction(value: any, message: string): void;
    static isNumber(value: any, message: string): void;
    static isObject(value: any, message: string): void;
    static isBoolean(value: any, message: string): void;
}

export declare enum Level {
    verbose = 0,
    debug = 1,
    info = 2,
    warn = 3,
    error = 4,
}
export declare type LogEvent = {
    logger: string;
    level: Level;
    color: string;
    args: IArguments;
};
export class Logger {
    private _name;
    constructor(name: string);
    static create(name: string): Logger;
    static setLevel(level: Level): void;
    static setSink(sink: (logEvent: LogEvent) => {}): void;
    /**
     * verbose(message [, ...args]): expects a string log message and optional object to dump to console
     */
    verbose(message: string, objectToDumpToConsole?: any): void;
    /**
     * debug(message [, ...args]): expects a string log message and optional object to dump to console
     */
    debug(message: string, objectToDumpToConsole?: any): void;
    /**
     * info(message [, ...args]): expects a string log message and optional object to dump to console
     */
    info(message: string, objectToDumpToConsole?: any): void;
    /**
     * warn(message [, ...args]): expects a string log message and optional object to dump to console
     */
    warn(message: string, objectToDumpToConsole?: any): void;
    /**
     * error(message [, ...args]): expects a string log message and optional object to dump to console
     */
    error(message: string, objectToDumpToConsole?: any): void;
    private _log(level, color, args);
}

export interface ISchedulerService {
    immediate: Rx.IScheduler;
    async: Rx.IScheduler;
}

export class SchedulerService implements ISchedulerService {
    readonly immediate: Rx.IScheduler;
    readonly async: Rx.IScheduler;
}

export class Utils {
    static parseBool(input: string): boolean;
    static isString(value: any): boolean;
    static isInt(n: number | string): boolean;
}

export function getComponentFactoryMetadata(target):ComponentFactoryMetadata;
export function componentFactory(componentKey:string, shortName:string);

export class ComponentFactoryMetadata {
    constructor(componentKey:string, shortName:string);

    readonly componentKey:string;
    readonly shortName:string;
}

export interface ComponentStateSet {
    componentFactoryKey: string;
    componentsState: Array<any>;
}

export abstract class ComponentFactoryBase extends DisposableBase {
    constructor(_container : Container);
    readonly componentKey: string;
    readonly shortName: string;

    protected abstract _createComponent(childContainer: Container, state?: any): any;

    public createComponent(state): void;
    public getAllComponentsState(): ComponentStateSet;
    public shutdownAllComponents(): void;
}

export interface ComponentMetadata {
    componentFactoryKey: string;
    shortName: string;
}

export interface FactoryEntry {
    componentFactoryKey: string;
    factory: ComponentFactoryBase;
    shortName: string;
}

export class ComponentRegistryModel extends ModelBase {
    public componentsMetadata: Array<ComponentMetadata>;

    constructor(router:Router);
    public getTitle() : string;

    readonly componentFactories: Array<FactoryEntry>;
    postProcess(): void;
    registerComponentFactory(componentFactory:ComponentFactoryBase): void;
    unregisterComponentFactory(componentFactory:ComponentFactoryBase): void;
    getComponentFactory(componentFactoryKey:string): ComponentFactoryBase;
}

export class LiteralResolver<T> implements Resolver<T> {
    public static readonly resolverName : string;
    resolve<T>(container : Container, dependencyKey:{value:any}): T;
}

export class SystemContainerConfiguration {
    public static configureContainer(rootContainer:Container);
}
export class SystemContainerConst {
    static readonly router: string;
    static readonly state_service: string;
    static readonly components_registry_model: string;
    static readonly region_manager: string;
    static readonly scheduler_service: string;
    static readonly module_loader: string;
}

export interface ComponentFactoryState {
    componentFactoryKey:string;
    componentsState: Array<any>;
}

export interface DefaultStateProvider {
    getComponentFactoriesState(layoutMode:string):Array<ComponentFactoryState>;
}

export interface ModuleConstructor {
    new (container:Container, stateService:StateService) : Module;
}

export interface Module extends DisposableBase {
    initialise() : void;
    configureContainer() : void ;
    registerComponents(componentRegistryModel:ComponentRegistryModel);
    getComponentsFactories();
    loadLayout(layoutMode:string);
    unloadLayout() : void;
}

export abstract class ModuleBase extends DisposableBase implements Module {
    protected container:Container;
    constructor(moduleKey, container:Container, stateService:StateService, defaultStateProvider?:DefaultStateProvider);
    abstract configureContainer();
    registerComponents(componentRegistryModel:ComponentRegistryModel);
    getComponentsFactories() : Array<ComponentFactoryBase>;
    initialise() : void;
    loadLayout(layoutMode:string);
    unloadLayout();
}

export class ModuleLoader {
    constructor(
        container: Container,
        componentRegistryModel: ComponentRegistryModel,
        stateService:StateService);

    loadModules<TModule extends ModuleConstructor>(...functionalModules:Array<TModule>);
    unloadModules();
    loadLayout(layoutMode:string);
}

export class MultiItemRegionEventConst {
    static selectedItemChanged: string;
}

export interface SelectedItemChangedEvent {
    selectedItem: RegionItem;
}

export class MultiItemRegionModel extends RegionModelBase {
    public items: Array<RegionItem>;
    public selectedItem: RegionItem;

    constructor(regionName: string, router: Router, regionManager: RegionManager);

    protected _addToRegion(title: string, modelId: string, displayContext?: string): void;

    protected _removeFromRegion(modelId: string, displayContext?: string): void;
}

export interface ItemViewProps  {
    className?: string;
    style?: any;
}

export default class ItemView extends React.Component<ItemViewProps, any> {
    render(): JSX.Element;
}

export interface MultiItemRegionViewProps extends ViewBaseProps<MultiItemRegionModel> {
    className?: string;
}

export class MultiItemRegionView extends ViewBase<MultiItemRegionView, MultiItemRegionModel, MultiItemRegionViewProps> {
}

export interface SelectableMultiItemViewProps extends ViewBaseProps<MultiItemRegionModel> {
    className?: string;
}

export class SelectableMultiItemView extends ViewBase<SelectableMultiItemView, MultiItemRegionModel, SelectableMultiItemViewProps> {
}

export class SingleItemRegionModel extends RegionModelBase {
    public item:RegionItem;
    constructor(regionName : string, router, regionManager);

    protected _addToRegion(title: string, modelId: string, displayContext?: string): void;
    protected _removeFromRegion(modelId: string, displayContext?: string): void;
}

export interface SingleItemRegionViewProps extends ViewBaseProps<SingleItemRegionModel> {
    className?: string;
}

export class SingleItemRegionView extends ViewBase<SingleItemRegionView, SingleItemRegionModel, SingleItemRegionViewProps> {
}

export class RegionItem {
    public title:string;
    public modelId:string;
    public displayContext:string;
    constructor(title: string, modelId:string, displayContext?:string);

    public readonly itemKey;
    public equals(modelId:string, displayContext?:string);
}

export type ViewCallBack = (model: ModelBase, viewKey?: string) => void;

export class RegionManager {// adds a region to the region manager
    public registerRegion(regionName: string, onAddingViewToRegionCallback: ViewCallBack, onRemovingFromRegionCallback: ViewCallBack);
    public unregisterRegion(regionName: string): void;
    public addToRegion(regionName: string, model:ModelBase, displayContext?:string);
    public removeFromRegion(regionName: string, model: ModelBase, displayContext?: string): void;
}

export abstract class RegionModelBase extends ModelBase {
    constructor(_regionName : string, router: Router, _regionManager);

    public observeEvents();
    public getTitle(): string;

    protected abstract _addToRegion(title:string, modelId:string, view:any, displayContext?:string);

    protected abstract _removeFromRegion(modelId:string, view:any, displayContext?:string);
}

export class StateService {
    public saveApplicationState<T>(moduleKey:string, layoutMode:string, state:T): void;
    public getApplicationState<T>(moduleKey:string, layoutMode:string): T;
}

export class IdFactory {
    public static createId(token);
}

export abstract class ModelBase extends DisposableBase {
    protected _modelId: string;
    protected _router: Router;
    constructor(_modelId: string, _router: Router);
    abstract getTitle(): string;
    observeEvents(): void;
    getState(): any;
    /**
     * Runs the given action on the dispatch loop for this model, ensures that any model observer will be notified of the change
     * @param action
     */
    ensureOnDispatchLoop(action: () => void): void;
    readonly modelId: string;
    readonly router: Router;
}

export interface ViewBaseProps<TModel> {
    model:TModel;
    router:Router;
}

export abstract class ViewBase<TComponent, TModel, TProps extends ViewBaseProps<TModel>>
    extends React.Component<TProps, any> {
    // This used to have all the model observation, that's now in esp-js-react's SmartComponent
    // This view is doing something by way of the generic constraint it's putting on the props, but that's not exactly code reuse.
    // Keeping this here for now, might delete at some point if we don't use it
}