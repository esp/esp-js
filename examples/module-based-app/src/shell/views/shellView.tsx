import * as React from 'react';
import {Router} from 'esp-js';
import {SmartComponent} from 'esp-js-react';
import {MultiItemRegionView, SingleItemRegionView} from 'esp-js-ui';
import ShellModel from '../models/shellModel';

export default class ShellView extends React.Component<{model:ShellModel, router:Router}, any> {
    render() {
        let model : ShellModel = this.props.model;
        return (
            <div>
                <h1>Shell View</h1>
                <div className='main-content'>
                    <div className='workspace'>
                        <SmartComponent
                            view={MultiItemRegionView}
                            modelId={model.workspaceRegion.modelId}
                        />
                    </div>
                    <div className='blotter'>
                        <SmartComponent
                            view={SingleItemRegionView}
                            className='blotter-container'
                            modelId={model.blotterRegion.modelId}
                        />
                    </div>
                </div>
            </div>
        );
    }
}



