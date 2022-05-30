import {Guard, utils} from 'esp-js';

export interface RetryPolicyLike {
    readonly description: string;
    readonly shouldRetry: boolean;
    readonly errorMessage: string | null;
    readonly retryAfterElapsedMs: number;
    readonly retryCount: number;
    readonly retryLimit: number;
    readonly lastError: any;

    /**
     * @deprecated, use onError(err);
     *
     * This has been deprecated however it needs to still exist on the API as there are cases when ESP is loaded with different versions into the DOM.
     * For example, with micro front ends the main shell may load the latest version, however that shell may then dynamically load modules of differing ESP versions,
     * those older modules may have older RetryPolicyLike APIs, hence we leave this here for a release or two.
     */
    incrementRetryCount?(error?: any): void;

    /**
     * Captures the last error (if given) and increments the retry count.
     */
    onError(error?: any): void;

    reset(): void;
}

export type ErrorMessageFactory = (err?: any) => string;

export class RetryPolicy implements RetryPolicyLike {
    /**
     * @deprecated, use retry
     * This has been left here for backwards compatability.
     */
    static createForUnlimitedRetry(description: string, retryAfterElapsedMs: number): RetryPolicy {
        return RetryPolicy.retry(description, retryAfterElapsedMs);
    }

    /**
     * A policy that does not retry
     */
    static none(description: string): RetryPolicy {
        return new RetryPolicy(description, null, 0); // do not retry
    }

    /**
     * Retries at a constant interval
     * @param description the operation being retired
     * @param retryIntervalMs the time at which to wait before retrying
     * @param retryLimit the maximum number of retires, omit or pass null for unlimited,
     * @param errorMessageFactory an optional error factory, can be omitted and a default which prints the error will be used
     */
    static retry(description: string, retryIntervalMs: number, retryLimit: number = null, errorMessageFactory: ErrorMessageFactory = null): RetryPolicy {
        return new RetryPolicy(description, retryIntervalMs, retryLimit, errorMessageFactory);
    }

    /**
     * Retries on a linear backoff curve, i.e. 5, 10, 15, 20, 20, 20
     * @param description the operation being retired
     * @param retryIntervalMs the initial wait time, then this will be doubled for each followed on retry
     * @param maxIntervalMs the maximum wait time
     * @param retryLimit the maximum number of retires, omit or pass null for unlimited,
     * @param errorMessageFactory an optional error factory, can be omitted and a default which prints the error will be used
     */
    static retryWithLinearBackOff(description: string, retryIntervalMs: number, maxIntervalMs: number, retryLimit: number = null, errorMessageFactory: ErrorMessageFactory = null): RetryPolicy {
        return new LinearBackOffRetryPolicy(description, retryIntervalMs, maxIntervalMs, retryLimit, errorMessageFactory);
    }

    /**
     * Retries on an exponential backoff curve, i.e. 1, 2, 3, 4, 7, 12, 20, 33, 55, 60, 60, 60
     * @param description the operation being retired
     * @param maxIntervalMs the maximum wait time
     * @param retryLimit the maximum number of retires, omit or pass null for unlimited,
     * @param backoffExponent the exponent which modifies the backoff curve, default is 0.5
     * @param errorMessageFactory an optional error factory, can be omitted and a default which prints the error will be used
     */
    static retryWithExponentialBackOff(description: string, maxIntervalMs: number, retryLimit: number = null, backoffExponent: number = 0.5, errorMessageFactory: ErrorMessageFactory = null): RetryPolicy {
        return new ExponentialBackOffRetryPolicy(description, backoffExponent, maxIntervalMs, retryLimit, errorMessageFactory);
    }

    protected _retryCount: number;
    protected _lastError: any = null;
    protected _errorMessageFactory: (err?: any) => string;

    constructor(
        protected readonly _description: string,
        protected readonly _retryAfterElapsedMs: number,
        protected readonly _retryLimit: number = null,
        errorMessageFactory: ErrorMessageFactory = null
    ) {
        Guard.isString(_description, 'description required');
        if (errorMessageFactory) {
            this._errorMessageFactory = errorMessageFactory;
        } else {
            this._errorMessageFactory = () => {
                if (this._lastError) {
                    return utils.getErrorText(this.lastError);
                } else {
                    return `errorMessageFactory not set, no error message available. Please pass an errorMessageFactory to your policy`;
                }
            };
        }
        this._retryCount = 0;
    }

    get description(): string {
        return this._description;
    }

    get shouldRetry(): boolean {
        // This is a bit of an odd check.
        // Historically if _retryLimit was -1 it meant 'unlimited', later null offered the same behaviour, hence this does an explicit check for either.
        if (this._retryLimit === null || this._retryLimit === -1) {
            return true;
        }
        return this._retryCount < this._retryLimit;
    }

    get errorMessage(): string | null {
        return this._errorMessageFactory(this._lastError);
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

    /**
     * @deprecated use onError
     */
    incrementRetryCount(error?: any): void {
        this.onError(error);
    }

    onError(error?: any): void {
        this._retryCount++;
        this._lastError = error;
    }

    reset(): void {
        this._retryCount = 0;
        this._lastError = null;
    }
}

/**
 * A policy that can retry on an exponential back off curve using a factor (i.e. 0.5).
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
export class ExponentialBackOffRetryPolicy extends RetryPolicy {
    constructor(
        description: string,
        private readonly _backoffExponent: number,
        private readonly _maxLimitMs: number,
        retryLimit: number = null,
        errorMessageFactory: ErrorMessageFactory = null
    ) {
        super(description, null, retryLimit, errorMessageFactory);
    }

    get retryAfterElapsedMs(): number {
        // we -1 on our retry so our exp(x) starts off with a 0
        const x = (this._retryCount - 1) * this._backoffExponent;
        let retryAfter = Math.round(Math.exp(x)) * 1000;
        return retryAfter > this._maxLimitMs ? this._maxLimitMs : retryAfter;
    }
}

export class LinearBackOffRetryPolicy extends RetryPolicy {
    constructor(
        description: string,
        retryAfterElapsedMs: number,
        private readonly _maxLimitMs: number,
        retryLimit: number = null,
        errorMessageFactory: ErrorMessageFactory = null
    ) {
        super(description, retryAfterElapsedMs, retryLimit, errorMessageFactory);
    }

    get retryAfterElapsedMs(): number {
        if (this._retryCount === 1) {
            return this._retryAfterElapsedMs;
        }
        let retryAfter = this._retryAfterElapsedMs * this._retryCount;
        return retryAfter > this._maxLimitMs
            ? this._maxLimitMs
            : retryAfter;
    }
}
