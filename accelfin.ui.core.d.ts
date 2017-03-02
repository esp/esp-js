import * as Rx from 'rx';
import * as esp from 'esp-js';

export class RetryPolicy {
    static defaultPolicy(errorMessage: string): RetryPolicy;
    static none(): RetryPolicy;
    static createForUnlimitedRetry(description: string, retryAfterElapsedMs: number): RetryPolicy;
    private _description;
    private _retryLimit;
    private _retryCount;
    private _errorMessage;
    private _retryAfterElapsedMs;
    constructor(description: string, retryLimit: number, retryAfterElapsedMs: number, errorMessage: string);
    description: string;
    shouldRetry: boolean;
    errorMessage: string;
    retryAfterElapsedMs: number;
    retryCount: number;
    retryLimit: number;
    incrementRetryCount(): void;
    reset(): void;
}

export class Decimal {
    private _unscaledValue;
    private _scale;
    static parse(value: any): Decimal;
    constructor(unscaledValue: number, scale?: number);
    unscaledValue: number;
    scale: number;
    value: number;
    format(formatter?: (decimal: Decimal) => string): string;
}

export class DecimalFormat {
    static ToString: (decimal: Decimal) => string;
    static ToLocal: (decimal: Decimal) => string;
}
export class Environment {
    static isRunningOnTablet: boolean;
}
export class Guard {
    static isDefined(value: any, message: string): void;
    static isFalse(value: any, message: string): void;
    static lengthIs<T>(array: Array<T>, expectedLength: number, message: string): void;
    static lengthGreaterThan<T>(array: Array<T>, expectedLength: number, message: string): void;
    static lengthIsAtLeast<T>(array: Array<T>, expectedLength: number, message: string): void;
    static isString(value: any, message: string): void;
    static stringIsNotEmpty(value: any, message: string): void;
    static isTrue(item: any, message: string): void;
    static isFunction(value: any, message: string): void;
    static isNumber(value: any, message: string): void;
    static isObject(value: any, message: string): void;
    static isBoolean(value: any, message: string): void;
}
export declare enum Level {
    verbose = 0,
    debug = 1,
    info = 2,
    warn = 3,
    error = 4,
}
export declare type LogEvent = {
    logger: string;
    level: Level;
    color: string;
    args: IArguments;
};
export class Logger {
    constructor(name: string);
    static create(name: string): Logger;
    static setLevel(level: Level): void;
    static setSink(sink: (logEvent: LogEvent) => {}): void;
    /**
     * verbose(message [, ...args]): expects a string log message and optional object to dump to console
     */
    verbose(message: string, objectToDumpToConsole?: any): void;
    /**
     * debug(message [, ...args]): expects a string log message and optional object to dump to console
     */
    debug(message: string, objectToDumpToConsole?: any): void;
    /**
     * info(message [, ...args]): expects a string log message and optional object to dump to console
     */
    info(message: string, objectToDumpToConsole?: any): void;
    /**
     * warn(message [, ...args]): expects a string log message and optional object to dump to console
     */
    warn(message: string, objectToDumpToConsole?: any): void;
    /**
     * error(message [, ...args]): expects a string log message and optional object to dump to console
     */
    error(message: string, objectToDumpToConsole?: any): void;
}

export interface ISchedulerService {
    immediate: Rx.IScheduler;
    async: Rx.IScheduler;
}
export declare class SchedulerService implements ISchedulerService {
    private _immediate;
    private _async;
    constructor();
    immediate: Rx.IScheduler;
    async: Rx.IScheduler;
}
export class Utils {
    static parseBool(input: string): boolean;
    static isString(value: any): boolean;
    static isInt(n: number | string): boolean;
}

declare module 'rx' {
    export interface Observable<T> {
        retryWithPolicy<T>(
            policy: RetryPolicy, 
            onError?: (err: Error) => void, 
            scheduler?: Rx.IScheduler): Rx.Observable<T>;

        subscribeWithRouter<T, TModel>(
            router: esp.Router,
            modelId: string,
            onNext?: (value: T, model: TModel) => void,
            onError?: (exception: any, model: TModel) => void,
            onCompleted?: (model: TModel) => void): Rx.Disposable;

    }
}