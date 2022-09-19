export enum Level {
    verbose = 'verbose',
    debug = 'debug',
    info = 'info',
    warn = 'warn',
    error = 'error',
    none = 'none'
}

export type Markers = {[key:string]: any};

export type LogEvent = {
    timestamp: Date,
    logger: string,
    level: Level,
    // if an array, the first items always considered to be the log
    message: string | any[],
    dumpAdditionalDetailsToConsole: boolean;
    markers: Markers;
    error: any;
    formatter: LogFormatter;
    logInUTCTime: boolean;
};

export interface LoggerConfig {
    dumpAdditionalDetailsToConsole: boolean;
    level: Level;
    /**
     * if set, logger names will be truncated or padded (will help logs line up), default null / off
     */
    padOrTruncateLoggerNameLengthTo: number;
    /**
     * A hook to replace the logging date, handy if back testing if you need to replace the value of 'now'.
     * Defaults to `() => new Date`
     */
    dateFactory?: () => Date;
    /**
     * If true log formatting will be done using UTC time.
     * Default false
     */
    logInUTCTime: boolean;
    /**
     * The log line formatter.
     *
     * Defaults to:
     * [YYYYMMDD][<level-shorthand>][<logger-name>] <text>
     * For example:
     * [20210915][D][MyLogger] Some Message
     */
    formatter: LogFormatter;
}

export type LogFormatter = (dateTime: Date, logEvent: LogEvent, loggerName: string, logText: string) => string;

export interface Sink {
    log(logEvent:LogEvent): void;
}
