export enum SplashScreenState {
    Default,
    Idle,
    Loading,
    Error
}

export interface SplashScreenModel {
    state: SplashScreenState;
    message?: string;
}