import * as React from 'react';
import {ConnectableComponent, PublishModelEventContext, PublishModelEventDelegate} from 'esp-js-react';
import {MultiItemRegionView, SingleItemRegionView} from 'esp-js-ui';
import {WorkspaceModel} from '../model/workspaceModel';
import {SplashScreenState} from '../model/splashScreenModel';
import {ShellEvents} from '../../../events';
import {Region} from 'esp-js-ui';
import { ModalView } from '../../modal/views/modal';

export interface ShellViewProps {
    model: WorkspaceModel;
}

const MultiItemRegionViewWrapped = ({model, }: { model: Region} ) => {
    return (<MultiItemRegionView model={model} showLoadingUi={true} />);
};

const SingleItemRegionViewWrapped = ({model, }: { model: Region} ) => {
    return (<SingleItemRegionView model={model} showLoadingUi={true} />);
};

export const WorkspaceView = ({model}: ShellViewProps) => {
    let mainContent;
    let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    const clearStateAndReload: () => void = React.useCallback(() => {
        publishEvent(ShellEvents.clearStateAndReload, {});
    }, []);
    const showPreferences: () => void = React.useCallback(() => {
        publishEvent(ShellEvents.showPreferences, {});
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
            <div>
                <ConnectableComponent
                    view={ModalView}
                    modelId={model.modalRegion.modelId}
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
            <div className={'appHeader'}>
                <h4>esp-js-ui Composite App Demo</h4>
                <button onClick={clearStateAndReload}>Clear Local Storage State & Reload</button>
                <button onClick={showPreferences}>Preferences</button>
            </div>
            {mainContent}
        </div>
    );
};