import {Guard} from 'esp-js';
import {utils} from 'esp-js';

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
     * @deprecated, use createForUnlimitedRetryWithLinearBackOff
     */
    static createForUnlimitedRetry(description: string, retryAfterElapsedMs: number): RetryPolicy {
        return RetryPolicy.createForUnlimitedRetryWithLinearBackOff(description, retryAfterElapsedMs);
    }

    static none(description: string): RetryPolicy {
        return new RetryPolicy(description, null, 0); // do not retry
    }

    static createForLimitedRetryWithLinearBackOff(description: string, retryLimit: number, retryAfterElapsedMs: number, errorMessageFactory: ErrorMessageFactory = null): RetryPolicy {
        return new RetryPolicy(description, retryLimit, retryAfterElapsedMs, errorMessageFactory);
    }

    static createForUnlimitedRetryWithLinearBackOff(description: string, retryAfterElapsedMs: number, errorMessageFactory: ErrorMessageFactory = null): RetryPolicy {
        return new RetryPolicy(description, -1, retryAfterElapsedMs, errorMessageFactory);
    }

    static createForLimitedRetryWithExponentialBackOff(description: string, retryLimit: number, maxLimitMs: number, errorMessageFactory: ErrorMessageFactory = null): RetryPolicy {
        return new ExponentialBackOffRetryPolicy(description, retryLimit, 0.5, maxLimitMs, errorMessageFactory);
    }

    static createForUnlimitedRetryWithExponentialBackOff(description: string, maxLimitMs: number, errorMessageFactory: ErrorMessageFactory = null): RetryPolicy {
        return new ExponentialBackOffRetryPolicy(description, -1, 0.5, maxLimitMs, errorMessageFactory);
    }

    protected _retryCount: number;
    protected _lastError: any = null;
    protected _errorMessageFactory: (err?: any) => string;

    constructor(
        protected readonly _description: string,
        protected readonly _retryLimit: number,
        protected readonly _retryAfterElapsedMs: number,
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
        return this._retryLimit === -1 || this._retryCount < this._retryLimit;
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
        retryLimit: number,
        private readonly _backoffExponent: number,
        private readonly _maxLimitMs: number,
        errorMessageFactory: ErrorMessageFactory = null
    ) {
        super(description, retryLimit, null, errorMessageFactory);
    }

    get retryAfterElapsedMs(): number {
        // we -1 on our retry so our exp(x) starts off with a 0
        const x = (this._retryCount - 1) * this._backoffExponent;
        let retryAfter = Math.round(Math.exp(x)) * 1000;
        return retryAfter > this._maxLimitMs ? this._maxLimitMs : retryAfter;
    }
}
