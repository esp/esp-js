import * as React from 'react';
import {ConnectableComponent, PublishModelEventContext, PublishModelEventDelegate} from 'esp-js-react';
import {MultiItemRegionView, SingleItemRegionView} from 'esp-js-ui';
import {ShellModel} from '../models/shellModel';
import {SplashScreenState} from '../models/splashScreenModel';
import {ShellEvents} from '../events';

export interface ShellViewProps {
    model: ShellModel;
}

export const ShellView = ({model}: ShellViewProps) => {
    let mainContent;
    let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    const clearStateAndReload: () => void = React.useCallback(() => {
        publishEvent(ShellEvents.clearStateAndReload, {});
    }, []);
    if (model.splashScreen.state === SplashScreenState.Idle) {
        mainContent = (<div className='main-content'>
            <div className='workspace'>
                <ConnectableComponent
                    view={MultiItemRegionView}
                    modelId={model.workspaceRegion.modelId}
                />
            </div>
            <div className='blotter'>
                <ConnectableComponent
                    view={SingleItemRegionView}
                    className='blotter-container'
                    modelId={model.blotterRegion.modelId}
                />
            </div>
        </div>);
    } else if (model.splashScreen.state === SplashScreenState.Default) {
        mainContent = null;
    } else {
        mainContent = (
            <div>
                {model.splashScreen.message}
            </div>
        );
    }
    return (
        <div className='shell'>
            <h4>esp-js-ui Composite App Demo</h4>
            <button style={{position: 'absolute', right: '20px', top: '15px'}} onClick={clearStateAndReload}>Clear Local Storage State & Reload</button>
            {mainContent}
        </div>
    );
};