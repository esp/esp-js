import * as React from 'react';
import {AppPreferencesModel} from '../model/appPreferencesModel';
import {PublishModelEventContext, PublishModelEventDelegate, ViewBinder} from 'esp-js-react';
import {ShellEvents} from '../../../events';
import './appPreferencesView.css';

export interface AppPreferencesViewProps {
    model: AppPreferencesModel;
}

export const AppPreferencesView = ({model}: AppPreferencesViewProps) => {
    let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    const closePreferences: () => void = React.useCallback(() => {
        publishEvent(ShellEvents.closePreferences, {});
    }, []);   const preferenceViews = model.preferencesEntities.map(pe => (<ViewBinder key={pe.name} model={pe} viewContext={null} />));
    return (
        <div className={'appPreferences'}>
            <button className={'appPreferences_closeButton'} onClick={closePreferences}>X</button>
            <h2>Preferences</h2>
            <>
                {preferenceViews}
            </>
        </div>
    );
};