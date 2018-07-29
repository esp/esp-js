import * as React from 'react';
import {Router} from 'esp-js';
import BlotterModel from '../models/blotterModel';

export default class BlotterView extends React.Component<{model:BlotterModel, router:Router}, any> {
    render() {
        let model : BlotterModel = this.props.model;
        return (
            <div>
                <h1>Blotter</h1>
            </div>
        );
    }
}