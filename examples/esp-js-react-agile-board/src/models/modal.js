import * as esp from 'esp-js';
import ModelBase from './modelBase';
import EventConsts from '../eventConsts';
import ModalView from '../views/modalView.jsx';
import { viewBinding } from 'esp-js-react';

@viewBinding(ModalView)
export default class Modal extends ModelBase {
    constructor(router) {
        super('modalModelid', router);
        this.modelToDisplay = null;
        this.modelViewContext = null;
        this.modalTitle = null;
        this._modalActionSubject = router.createSubject();
    }

    observeEvents() {
        super.observeEvents();
        this.router.addModel(this.modelId, this);
    }

    @esp.observeEvent(EventConsts.MODAL_ACTION_RESULT)
    _onModalActionResults(event) {
        this._modalActionSubject.onNext(event.resultType);
    }

    open(modelToDisplay, modelViewContext, title) {
        return this.router.createObservableFor(this.modelId, o => {
            this.modelToDisplay = modelToDisplay;
            this.modelViewContext = modelViewContext;
            this.modalTitle = title || 'Modal Dialog';
            let subscription = this._modalActionSubject.take(1).subscribe(
                result => o.onNext(result),
                () => {
                    this._clear();
                    o.onCompleted();
                });
            return () => {
                this._clear();
                subscription.dispose();
            };
        });
    }

    _clear() {
        this.modelToDisplay = null;
        this.modelViewContext = null;
        this.modalTitle = null;
    }
}