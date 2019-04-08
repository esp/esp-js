import { ModelBase } from './modelBase';
/**
 * Model for app wide modal dialogs
 */
export declare class Modal extends ModelBase {
    private _modelIdToDisplay;
    private _modelViewContext;
    private _modalTitle;
    constructor(router: any);
    readonly modelIdToDisplay: string;
    readonly modelViewContext: string;
    readonly modalTitle: string;
    observeEvents(): void;
    open(modelIdToDisplay: string, modelViewContext?: string): import("../../../../packages/esp-js/.dist/typings").RouterObservable<{}>;
    private _clear;
}
