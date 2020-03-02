
export type  Disposable = {
    dispose (): void;
    readonly isDisposed?: boolean;
};

// Exists for rx compatibility with rxjs5, it's an exact match for our DisposableType above.
export type Subscription = {
    unsubscribe(): void;
    readonly closed: boolean;
};

export type DisposableOrFunction = Disposable | (() => void);

export type DisposableItem = Disposable | Subscription | (() => void);