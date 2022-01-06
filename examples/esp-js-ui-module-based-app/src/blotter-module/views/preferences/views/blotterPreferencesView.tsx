import * as React from 'react';
import {BlotterPreferences} from '../model/blotterPreferences';

export interface BlotterPreferencesViewProps {
    model: BlotterPreferences;
}

export const BlotterPreferencesView = ({model}: BlotterPreferencesViewProps) => {
    return (
        <div>
            <h3>Blotter Preferences</h3>
            <p>Blotter preferences here.</p>
        </div>
    );
};