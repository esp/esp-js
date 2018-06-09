export interface Disposable {
    readonly isDisposed: boolean;
    dispose (): void;
}