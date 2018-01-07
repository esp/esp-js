import { ModelBase } from './modelBase';
import { ModalView } from '../views/modalView';
import { viewBinding } from 'esp-js-react';
import { idFactory } from './idFactory';

/**
 * Model for app wide modal dialogs
 */
@viewBinding(ModalView)
export class Modal extends ModelBase {
    private _modelIdToDisplay: string;
    private _modelViewContext: string;
    private _modalTitle: string;

    constructor(router) {
        super(idFactory('modal'), router);
        this._modelIdToDisplay = null;
        this._modelViewContext = null;
        this._modalTitle = '';
    }

    public get modelIdToDisplay() {
        return this._modelIdToDisplay;
    }

    public get modelViewContext() {
        return this._modelViewContext;
    }

    public get modalTitle() {
        return this._modalTitle;
    }

    public observeEvents() {
        super.observeEvents();
        this.router.addModel(this.modelId, this);
    }

    public open(modelIdToDisplay: string, modelViewContext?: string) {
        return this.router.createObservableFor(this.modelId, () => {
            this._modelIdToDisplay = modelIdToDisplay;
            this._modelViewContext = modelViewContext;
            return () => {
                this._clear();
            };
        });
    }

    private _clear() {
        this._modelIdToDisplay = null;
        this._modelViewContext = null;
        this._modalTitle = '';
    }
}