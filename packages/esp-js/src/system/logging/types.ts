export enum Level {
    verbose = 'verbose',
    debug = 'debug',
    info = 'info',
    warn = 'warn',
    error = 'error',
    none = 'none'
}

export type Markers = {[key:string]: string};

export type LogEvent = {
    timestamp: Date,
    logger: string,
    level: Level,
    // if an array, the first items always considered to be the log
    message: string | any[],
    dumpAdditionalDetailsToConsole: boolean;
    markers: Markers;
    error: any;
};

export interface LoggerConfig {
    dumpAdditionalDetailsToConsole: boolean;
    level: Level;
    /**
     * if set, logger names will be truncated or padded (will help logs line up), default null / off
     */
    padOrTruncateLoggerNameLengthTo: number;
}

export interface Sink {
    log(logEvent:LogEvent): void;
}
