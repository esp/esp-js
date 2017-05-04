import * as React from 'react';
import {Router} from 'esp-js';
import {SmartComponent} from 'esp-js-react';
import {MultiItemRegionView, SingleItemRegionView} from 'esp-js-ui';
import ShellModel from '../models/shellModel';
import { SplashScreenState } from '../models/splashScreenModel';

export default class ShellView extends React.Component<{model:ShellModel, router:Router}, any> {
    render() {
        let model : ShellModel = this.props.model;
        let mainContent;

        if(model.splashScreen.state === SplashScreenState.Idle) {
            mainContent = (<div className='main-content'>
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
                </div>);
        } else if(model.splashScreen.state === SplashScreenState.Default) {
            mainContent = null;
        } else {
            mainContent = (
                <div>
                    {model.splashScreen.message}
                </div>
            );
        }

        return (
            <div>
                <h1>Shell View</h1>
                {mainContent}
            </div>
        );
    }
}



