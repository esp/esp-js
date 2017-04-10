import { Container, Resolver } from 'microdi-js';
import { Router, DisposableBase } from 'esp-js';
import * as React from 'react';

export declare function getComponentFactoryMetadata(target: any): ComponentFactoryMetadata;
export declare function componentFactory(componentKey: string, shortName: string, showInAddComponentMenu?: boolean): (target: any) => void;
export declare class ComponentFactoryMetadata {
    constructor(componentKey: string, shortName: string, showInAddComponentMenu?: boolean);
    readonly componentKey: string;
    readonly shortName: string;
    readonly showInAddComponentMenu: boolean;
}
export declare abstract class ComponentFactoryBase extends DisposableBase {
    constructor(_container: Container);
    readonly componentKey: string;
    readonly shortName: string;
    readonly showInAddComponentMenu: boolean;
    protected abstract _createComponent(childContainer: Container, state?: any): any;
    createComponent(state?: any): void;
    getAllComponentsState(): {
        componentFactoryKey: string;
        componentsState: any[];
    };
    shutdownAllComponents(): void;
}
export interface ComponentMetadata {
    componentFactoryKey: string;
    shortName: string;
    isWorkspaceItem: boolean;
}
export class ComponentRegistryModel extends ModelBase {
    componentsMetadata: Array<ComponentMetadata>;
    constructor(modelId: string, router: Router);
    getTitle(): string;
    readonly componentFactories: Iterable<FactoryEntry>;
    postProcess(): void;
    registerComponentFactory(componentFactory: ComponentFactoryBase): void;
    unregisterComponentFactory(componentFactory: ComponentFactoryBase): void;
    getComponentFactory(componentFactoryKey: string): ComponentFactoryBase;
}

export interface FactoryEntry {
    componentFactoryKey: string;
    factory: ComponentFactoryBase;
    shortName: string;
    isWorkspaceItem: boolean;
}
export class LiteralResolver implements Resolver<any> {
    static readonly name: string;
    resolve<T>(container: Container, dependencyKey: {
        value: any;
    }): any;
}
export class MultiTileRegionEventConst {
    static readonly selectedTileChanged: string;
}
export interface SelectedTileChangedEvent {
    selectedItem: RegionItem;
}

export declare abstract class RegionModelBase extends ModelBase {
    constructor(regionName: string, router: Router, regionManager: any);
    observeEvents(): void;
    getTitle(): string;
    abstract _addToRegion(title: string, modelId: string, view: any, displayContext?: string): any;
    abstract _removeFromRegion(modelId: string, view: any, displayContext?: string): any;
}

export class MultiTileRegionModel extends RegionModelBase {
    tileItems: Array<RegionItem>;
    selectedItem: RegionItem;
    constructor(regionName: string, router: Router, regionManager: RegionManager);
    _observeSelectedTileChanged(ev: SelectedTileChangedEvent): void;
    _addToRegion(title: string, modelId: string, displayContext?: string): void;
    _removeFromRegion(modelId: string, displayContext?: string): void;
}

export interface MultiTileRegionViewProps extends ViewBaseProps<MultiTileRegionModel> {
    className?: string;
}
export class MultiTileRegionView extends ViewBase<MultiTileRegionView, MultiTileRegionModel, MultiTileRegionViewProps> {
    render(): JSX.Element;
}

export interface SelectableMultiTileViewProps extends ViewBaseProps<MultiTileRegionModel> {
    className?: string;
}
export class SelectableMultiTileView extends ViewBase<SelectableMultiTileView, MultiTileRegionModel, SelectableMultiTileViewProps> {
    render(): JSX.Element;
}
export interface TileItemViewProps {
    className?: string;
    style?: any;
}
export class TileItemView extends React.Component<TileItemViewProps, any> {
    render(): JSX.Element;
}

export class SingleItemRegionsModel extends RegionModelBase {
    item: RegionItem;
    constructor(regionName: string, router: any, regionManager: any);
    _addToRegion(title: string, modelId: string, displayContext?: string): void;
    _removeFromRegion(modelId: string, displayContext?: string): void;
}

export interface SingleItemRegionViewProps extends ViewBaseProps<SingleItemRegionsModel> {
    className?: string;
}
export class SingleItemRegionView extends ViewBase<SingleItemRegionView, SingleItemRegionsModel, SingleItemRegionViewProps> {
    render(): JSX.Element;
}

export class RegionItem {
    title: string;
    modelId: string;
    displayContext: string;
    constructor(title: string, modelId: string, displayContext?: string);
    readonly itemKey: string;
    equals(modelId: string, displayContext?: string): boolean;
}

export type ViewCallBack = (model: ModelBase, viewKey?: string) => void;

export class RegionManager {
    constructor();
    registerRegion(regionName: string, onAddingViewToRegionCallback: ViewCallBack, onRemovingFromRegionCallback: ViewCallBack): void;
    unregisterRegion(regionName: string): void;
    addToRegion(regionName: string, model: ModelBase, displayContext?: string): void;
    removeFromRegion(regionName: string, model: ModelBase, displayContext?: string): void;
}

export class StateService {
    saveApplicationState<T>(moduleKey: string, layoutMode: LayoutMode, state: T): void;
    getApplicationState<T>(moduleKey: string, layoutMode: LayoutMode): T;
}
export class LayoutMode {
    static _desktop: LayoutMode;
    static _tabletDetached: LayoutMode;
    static _tabledAttached: LayoutMode;
    static readonly desktop: LayoutMode;
    static readonly tabletDetached: LayoutMode;
    static readonly tabletAttached: LayoutMode;
    static readonly values: Array<LayoutMode>;
    constructor(status: string);
    readonly name: string;
}
export declare abstract class ModelBase extends DisposableBase {
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
    model: TModel;
    router: Router;
}
export abstract class ViewBase<TComponent, TModel, TProps extends ViewBaseProps<TModel>> extends React.Component<TProps, any> {
}
