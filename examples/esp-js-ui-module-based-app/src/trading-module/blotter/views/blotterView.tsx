import * as React from 'react';
import {Router} from 'esp-js';
import {BlotterModel} from '../models/blotterModel';

export class BlotterView extends React.Component<{model:BlotterModel, router:Router}, any> {
    render() {
        let model : BlotterModel = this.props.model;
        return (
            <div>
                <h4>Blotter</h4>
            </div>
        );
    }
}