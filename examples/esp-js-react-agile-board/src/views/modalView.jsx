import * as esp from 'esp-js';
import React from 'react';
import EventConsts from '../eventConsts';
import ModalResultType from '../models/modalResultType';
import { ViewBinder } from 'esp-js-react';

export default class ModalView extends React.Component {
    static propTypes = {
        model: React.PropTypes.object.isRequired,
        router: React.PropTypes.instanceOf(esp.Router).isRequired
    };

    _publishEvent(resultType) {
        this.props.router.publishEvent(this.props.model.modelId, EventConsts.MODAL_ACTION_RESULT, {resultType});
    }

    render() {
        let modal = this.props.model;
        if (!modal.modelToDisplay) {
            return null;
        }
        return (
            <div className="modal">
                <div className='modal__content'>
                    <div className='modal__header'>
                        <span
                            className='modal__close'
                            onClick={() => this._publishEvent(ModalResultType.Canceled)}>x</span>
                        <h2>{modal.modalTitle}</h2>
                    </div>
                    <div className="modal__body">
                        <ViewBinder model={modal.modelToDisplay} viewContext={modal.modelViewContext} />
                    </div>
                    <div className='modal__footer'>
                        <input
                            type="button"
                            onClick={() => this._publishEvent(ModalResultType.Canceled)}
                            value="Cancel"/>
                        <input
                            type="button"
                            onClick={() => this._publishEvent(ModalResultType.Saved)}
                            value={modal.saveButtonText}/>
                    </div>
                </div>
            </div>
        );
    }
}