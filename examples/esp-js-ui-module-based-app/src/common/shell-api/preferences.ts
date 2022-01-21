export interface PreferenceState {
    [key: string]: any;
}

export interface PreferencesEntity {
    name: string;
    getPreferenceState(): PreferenceState;
}

export class PreferenceConsts {
    public static preferenceEntity = 'preferenceEntity';
}