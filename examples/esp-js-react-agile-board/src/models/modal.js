import ModelBase from './modelBase';
import ModalView from '../views/modalView.jsx';
import { viewBinding } from 'esp-js-react';
import idFactory from './idFactory';

/**
 * Model for app wide modal dialogs
 */
@viewBinding(ModalView)
export default class Modal extends ModelBase {
    constructor(router) {
        super(idFactory('modal'), router);
        this.modelIdToDisplay = null;
        this.modelViewContext = null;
        this.modalTitle = null;
    }

    observeEvents() {
        super.observeEvents();
        this.router.addModel(this.modelId, this);
    }

    open(modelIdToDisplay, modelViewContext) {
        return this.router.createObservableFor(this.modelId, () => {
            this.modelIdToDisplay = modelIdToDisplay;
            this.modelViewContext = modelViewContext;
            return () => {
                this._clear();
            };
        });
    }

    _clear() {
        this.modelIdToDisplay = null;
        this.modelViewContext = null;
        this.modalTitle = '';
    }
}