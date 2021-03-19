export enum SplashScreenState {
    Default,
    Error
}

export interface SplashScreenModel {
    state: SplashScreenState;
    message?: string;
}