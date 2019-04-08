import { ModelBase } from './modelBase';
import { Router } from 'esp-js';
import { Modal } from './modal';
export declare enum ItemNameDialogResultType {
    Canceled = "Canceled",
    Saved = "Saved"
}
export interface ItemNameDialogResult {
    name?: string;
    type: ItemNameDialogResultType;
}
/**
 * A dialog for getting the name of something
 */
export declare class ItemNameDialog extends ModelBase {
    private _itemName;
    private _modalTitle;
    private _saveButtonText;
    private _modal;
    private _resultsSubject;
    private _canSave;
    private _modalSubscription;
    constructor(router: Router, modal: Modal, modalTitle: string, saveButtonText: string);
    readonly itemName: string;
    readonly modalTitle: string;
    readonly saveButtonText: string;
    readonly modal: Modal;
    readonly canSave: boolean;
    readonly resultsStream: import("../../../../packages/esp-js/.dist/typings").RouterObservable<ItemNameDialogResult>;
    observeEvents(): void;
    private _onItemNameChanged;
    private _onCanceled;
    private _onSaved;
    open(): void;
    close(): void;
    private _reset;
}
