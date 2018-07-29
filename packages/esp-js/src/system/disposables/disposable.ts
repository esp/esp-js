export type DisposableOrFunction = Disposable | (() => void);

export interface Disposable {
    readonly isDisposed?: boolean;
    dispose (): void;
}