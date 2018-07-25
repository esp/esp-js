export default class RetryPolicy {
    static defaultPolicy(errorMessage: string): RetryPolicy {
        return new RetryPolicy('DefaultRetryPolicy', 3, 5000, errorMessage); // retry after 2 seconds, do the retry upto a max of 3 times
    }
    static none(): RetryPolicy {
        return new RetryPolicy('NoneRetryPolicy', 0, 0, null); // do not retry
    }
    static createForUnlimitedRetry(description: string, retryAfterElapsedMs: number): RetryPolicy {
        return new RetryPolicy(description, -1, retryAfterElapsedMs, null);
    }

    private _description: string;
    private _retryLimit: number;
    private _retryCount: number;
    private _errorMessage: string | null;
    private _retryAfterElapsedMs: number;

    // TODO a backoff policy, i.e. backoff to a given time then retry at max backoff
    constructor(description: string, retryLimit: number, retryAfterElapsedMs: number, errorMessage: string | null) {
        this._description = description;
        this._retryLimit = retryLimit;
        this._retryCount = 0;
        this._errorMessage = errorMessage;
        this._retryAfterElapsedMs = retryAfterElapsedMs;
    }
    get description(): string {
        return this._description;
    }
    get shouldRetry(): boolean {
        return this._retryLimit === -1 || this._retryCount < this._retryLimit;
    }
    get errorMessage(): string | null {
        return this._errorMessage;
    }
    get retryAfterElapsedMs(): number {
        return this._retryAfterElapsedMs;
    }
    get retryCount(): number {
        return this._retryCount;
    }
    get retryLimit(): number {
        return this._retryLimit;
    }
    incrementRetryCount(): void {
        this._retryCount++;
    }
    reset(): void {
        this._retryCount = 0;
    }
}
