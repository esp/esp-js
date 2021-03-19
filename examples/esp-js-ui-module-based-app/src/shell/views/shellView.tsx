import * as React from 'react';
import {ConnectableComponent, PublishModelEventContext, PublishModelEventDelegate} from 'esp-js-react';
import {MultiItemRegionView, SingleItemRegionView} from 'esp-js-ui';
import {ShellModel} from '../models/shellModel';
import {SplashScreenState} from '../models/splashScreenModel';
import {ShellEvents} from '../events';
import {Region} from 'esp-js-ui';

export interface ShellViewProps {
    model: ShellModel;
}

const MultiItemRegionViewWrapped = ({model, }: { model: Region} ) => {
    return (<MultiItemRegionView model={model} showLoadingUi={true} />);
};

const SingleItemRegionViewWrapped = ({model, }: { model: Region} ) => {
    return (<SingleItemRegionView model={model} showLoadingUi={true} />);
};

export const ShellView = ({model}: ShellViewProps) => {
    let mainContent;
    let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    const clearStateAndReload: () => void = React.useCallback(() => {
        publishEvent(ShellEvents.clearStateAndReload, {});
    }, []);
    if (model.splashScreen.state === SplashScreenState.Default) {
        mainContent = (<div className='main-content'>
            <div className='workspace'>
                <ConnectableComponent
                    view={MultiItemRegionViewWrapped}
                    modelId={model.workspaceRegion.modelId}
                />
            </div>
            <div className='blotter'>
                <ConnectableComponent
                    view={SingleItemRegionViewWrapped}
                    className='blotter-container'
                    modelId={model.blotterRegion.modelId}
                />
            </div>
        </div>);
    } else if (model.splashScreen.state === SplashScreenState.Error) {
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