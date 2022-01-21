import {viewBinding} from 'esp-js-react';
import {BlotterPreferencesView} from '../views';
import {Router} from 'esp-js';
import {PreferencesEntity, PreferenceState} from '../../../../common';

@viewBinding(BlotterPreferencesView)
export class BlotterPreferences implements PreferencesEntity {
    constructor(private _modelId: string, private _router: Router) {
    }

    public get name(): string {
        return 'Blotter';
    }

    getPreferenceState(): PreferenceState {
        // these would initially come from a persistent store, then be updated if the users changed them on the view.
        return {
            'blotter-pref-1': true,
            'blotter-pref-2': 5
        };
    }
}