export interface RetryPolicyLike {
    readonly description: string;
    readonly shouldRetry: boolean;
    readonly errorMessage: string | null;
    readonly retryAfterElapsedMs: number;
    readonly retryCount: number;
    readonly retryLimit: number;
    readonly lastError: any;

    incrementRetryCount(error?: any): void;

    reset(): void;
}

export class RetryPolicy implements RetryPolicyLike {
    static defaultPolicy(errorMessage: string): RetryPolicy {
        return new RetryPolicy('DefaultRetryPolicy', 3, 5000, errorMessage); // retry after 2 seconds, do the retry upto a max of 3 times
    }
    static none(): RetryPolicy {
        return new RetryPolicy('NoneRetryPolicy', 0, 0, null); // do not retry
    }
    static createForUnlimitedRetry(description: string, retryAfterElapsedMs: number): RetryPolicy {
        return new RetryPolicy(description, -1, retryAfterElapsedMs, null);
    }

    private _retryCount: number;
    private _lastError: any = null;

    constructor(
        private readonly _description: string,
        private readonly _retryLimit: number,
        private readonly _retryAfterElapsedMs: number,
        private readonly _errorMessage: string | null) {

        this._retryCount = 0;
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

    get lastError(): any {
        return this._lastError;
    }

    incrementRetryCount(error?: any): void {
        this._retryCount++;
        this._lastError = error;
    }

    reset(): void {
        this._retryCount = 0;
        this._lastError = null;
    }
}

export class ExponentialBackOffRetryPolicy implements RetryPolicyLike {
    /**
     * Retries on an expotential backk off curve using a factor of 0.5.
     * Retries up to the given max (defaults to 10s)
     *
     * Example retry intervals (in ms) to give an idea of the triggers
     * 1_000
     * 2_000
     * 3_000
     * 4_000
     * 7_000
     * 12_000
     * 20_000
     * 33_000
     * 55_000
     * 90_000
     * 148_000
     * 245_000
     * 403_000
     * 665_000
     */
    static defaultPolicy(description: string, errorMessage: string, maxLimitMs = 10_000): RetryPolicyLike {
        return new ExponentialBackOffRetryPolicy(description, errorMessage, -1, 0.5, maxLimitMs);
    }

    static createdWithLimitedRetry(description: string, errorMessage: string, retryLimit: number, maxLimitMs = 10_000): RetryPolicyLike {
        return new ExponentialBackOffRetryPolicy(description, errorMessage, retryLimit, 0.5, maxLimitMs);
    }

    private _retryCount: number;
    private _lastError: any = null;

    constructor(
        private readonly _description: string,
        private readonly _errorMessage: string,
        private readonly _retryLimit: number,
        private readonly _backoffExponent: number,
        private readonly _maxLimitMs: number
    ) {
        this._retryCount = 0;
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
        // we -1 on our retry so our exp(x) starts off with a 0
        const x = (this._retryCount - 1) * this._backoffExponent;
        let retryAfter = Math.round(Math.exp(x)) * 1000;
        return retryAfter > this._maxLimitMs ? this._maxLimitMs : retryAfter;
    }

    get retryCount(): number {
        return this._retryCount;
    }

    get retryLimit(): number {
        return this._retryLimit;
    }

    get lastError(): any {
        return this._lastError;
    }

    incrementRetryCount(error?: any): void {
        this._retryCount++;
        this._lastError = error;
    }

    reset(): void {
        this._retryCount = 0;
        this._lastError = null;
    }
}
