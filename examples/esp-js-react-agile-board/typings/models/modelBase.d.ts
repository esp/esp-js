import { Disposable, Router } from 'esp-js';
export declare class ModelBase {
    private _modelId;
    private _router;
    private _disposables;
    constructor(modelId: string, router: Router);
    readonly modelId: string;
    readonly router: Router;
    observeEvents(): void;
    addDisposable(disposable: Disposable): void;
    dispose(): void;
    ensureOnDispatchLoop(action: any): void;
}
