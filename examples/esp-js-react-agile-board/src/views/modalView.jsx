import * as esp from 'esp-js';
import React from 'react';
import { SmartComponent } from 'esp-js-react';

export default class ModalView extends React.Component {
    static propTypes = {
        model: React.PropTypes.object.isRequired,
        router: React.PropTypes.instanceOf(esp.Router).isRequired
    };

    render() {
        let modal = this.props.model;
        if (!modal.modelIdToDisplay) {
            return null;
        }
        return (
            <div className="modal">
                <div className='modal__content'>
                    <SmartComponent modelId={modal.modelIdToDisplay} viewContext={modal.modelViewContext} />
                </div>
            </div>
        );
    }
}