export declare enum SplashScreenState {
    Default = 0,
    Idle = 1,
    Loading = 2,
    Error = 3
}
export interface SplashScreenModel {
    state: SplashScreenState;
    message?: string;
}
