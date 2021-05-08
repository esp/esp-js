import {Guard} from '../guard';
import {utils} from '../utils';
import {GlobalState} from '../globalState';
import {CompositeSink, ConsoleSink, Sink} from './sinks';

export enum Level {
    verbose = 'verbose',
    debug = 'debug',
    info = 'info',
    warn = 'warn',
    error = 'error',
    none = 'none'
}

export interface LoggerConfig {
    dumpAdditionalDetailsToConsole: boolean;
    level: Level;
    /**
     * if set, logger names will be truncated or padded (will help logs line up)
     */
    padOrTruncateLoggerNameLengthTo: number;
}

// note: if you want verbose you need to change this explicitly, this is just the initial default
let _currentLevel: Level = Level.debug;
let _sink = new CompositeSink(new ConsoleSink());
let _loggerConfigs : {[key: string]: LoggerConfig} = {};

let _defaultLoggerConfig: LoggerConfig = {
    dumpAdditionalDetailsToConsole: false,
    level: _currentLevel,
    padOrTruncateLoggerNameLengthTo: null
};

const getOrCreateLoggerConfig = (loggerName: string, overrides: Partial<LoggerConfig> = {}) => {
    let loggerConfig = _loggerConfigs[loggerName];
    if (!loggerConfig) {
        // using .create here as the config programmatically inherits from the base.
        // this allows the global logging level to be changed for all loggers.
        loggerConfig = Object.create(LoggingConfig.defaultLoggerConfig);
        // note we can't spread due to this config prototypically inheriting
        if (typeof overrides.level !== 'undefined') {
            loggerConfig.level = overrides.level;
        }
        if (typeof overrides.dumpAdditionalDetailsToConsole !== 'undefined') {
            loggerConfig.dumpAdditionalDetailsToConsole = overrides.dumpAdditionalDetailsToConsole;
        }
        _loggerConfigs[loggerName] = loggerConfig;
    }
    return loggerConfig;
};

export class LoggingConfig {
    /**
     * Sets the level for all loggers, including existing ones
     * @param level
     */
    static setLevel(level: Level): void {
        _currentLevel = level;
        _defaultLoggerConfig.level = level;
    }

    /**
     * Adds a sink to process log results
     * @param sink
     */
    static addSinks(...sink: Array<Sink>): void {
        _sink.addSinks(...sink);
    }

    static clearSinks(): void {
        _sink.clearSinks();
    }

    /**
     * Redirects any console logs so they go via configured sinks.
     */
    static captureConsoleLogs(): void {
        captureConsoleLogsViaLoggingSink();
    }

    static get defaultLoggerConfig()  : LoggerConfig {
        return _defaultLoggerConfig;
    }

    static getLoggerConfig(loggerName: string): LoggerConfig {
        return getOrCreateLoggerConfig(loggerName);
    }
}

declare global {
    interface Window { _esp: { LoggingConfig:LoggingConfig }; }
}

(<any>GlobalState)._esp = {
    LoggingConfig : LoggingConfig
};

/**
 * Replaces window.console's log, info, warn and error functions with a variants that sends logs to the _sink.
 * Note that the sink is a Composite sink so logs will still appear in the console via ConsoleSink.
 */
export const captureConsoleLogsViaLoggingSink = () => {
    const _log = (level: Level, ...args: any[]) => {
        _sink.log({
            timestamp: new Date(),
            logger: 'Console',
            level: level,
            message: args,
            dumpAdditionalDetailsToConsole: true, // always dump these for console logs
            markers: null,
            error: null // we don't support this for raw console logs
        });
    };

    GlobalState.console.log = (...args: any[]) => {
        _log(Level.debug, ...args);
    };

    GlobalState.console.info = (...args: any[]) => {
        _log(Level.info, ...args);
    };

    GlobalState.console.warn = (...args: any[]) => {
        _log(Level.warn, ...args);
    };
    GlobalState.console.error = (...args: any[]) => {
        _log(Level.error, ...args);
    };
};

function getLevelNumber(level:Level) : number {
    switch(level)  {
        case Level.verbose:
            return 0;
        case Level.debug:
            return 1;
        case Level.info:
            return 2;
        case Level.warn:
            return 3;
        case Level.error:
            return 4;
        case Level.none:
            return 5;
        default:
            return 5;
    }
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

export class Logger {
    constructor(
        private _name: string,
        private _loggerConfig: LoggerConfig
    ) {
    }

    public get config() {
        return this._loggerConfig;
    }

    static create(name: string, loggerConfig: Partial<LoggerConfig> = {}): Logger {
        Guard.isDefined(name, 'The name argument should be defined');
        Guard.isString(name, 'The name argument should be a string');
        return new Logger(name, getOrCreateLoggerConfig(name, loggerConfig));
    }

    /**
     * @deprecated The method should not be used
     */
    group(...args: any[]) {
        console.group(...args);
    }

    /**
     * @deprecated The method should not be used
     */
    groupCollapsed(...args: any[]) {
        console.groupCollapsed(...args);
    }

    /**
     * @deprecated The method should not be used
     */
    groupEnd() {
        console.groupEnd();
    }

    /**
     * verbose(message [, ...args]): expects a string log message and optional object to dump to console
     */
    verbose(message: string, additionalDetails?: any): void;
    verbose(markers:Markers, message: string, additionalDetails?: any): void;
    verbose(...args: any[]) : void {
        if (this._isLevelEnabled(Level.verbose)) {
            this._log(Level.verbose, args);
        }
    }

    private _isLevelEnabled(level: Level) : boolean {
        return getLevelNumber(this._loggerConfig.level) <= getLevelNumber(level);
    }

    /**
     * debug(message [, ...args]): expects a string log message and optional object to dump to console
     */
    debug(message: string, additionalDetails?: any): void;
    debug(markers:Markers, message: string, additionalDetails?: any): void;
    debug(...args: any[]) : void {
        if (this._isLevelEnabled(Level.debug)) {
            this._log(Level.debug, args);
        }
    }

    /**
     * info(message [, ...args]): expects a string log message and optional object to dump to console
     */
    info(message: string, additionalDetails?: any): void;
    info(markers:Markers, message: string, additionalDetails?: any): void;
    info(...args: any[]) : void {
        if (this._isLevelEnabled(Level.info)) {
            this._log(Level.info, args);
        }
    }

    /**
     * warn(message [, ...args]): expects a string log message and optional object to dump to console
     */
    warn(message: string, additionalDetails?: any): void;
    warn(markers:Markers, message: string, additionalDetails?: any): void;
    warn(...args: any[]) : void {
        if (this._isLevelEnabled(Level.warn)) {
            this._log(Level.warn, args);
        }
    }

    /**
     * error(message [, ...args]): expects a string log message and optional object to dump to console
     */
    error(message: string, error?: any): void;
    error(markers:Markers, message: string, error?: any): void;
    error(...args: any[]) : void {
        if (this._isLevelEnabled(Level.error)) {
            this._log(Level.error, args);
        }
    }

    private _log(level: Level, args: any[]): void {
        let markers : Markers = {};
        let error = null;
        let firstItemIsMarker = utils.isObject(args[0]);
        if (firstItemIsMarker) {
            markers = args[0];
            // remove the marker as we've just captured it above
            args.splice( 0, 1);
        }
        if (level === Level.error) {
            // At this point, any marker will be gone.
            // We can assume args has a message, and/or a message an error
            // We want to capture the error separately.
            if (args.length === 2) {
                // pop the error out of args
                error = args.splice(1, 1)[0];
            }
        }
        _sink.log({
            timestamp: new Date(),
            logger: this._name,
            level: level,
            message: args,
            dumpAdditionalDetailsToConsole: this._loggerConfig.dumpAdditionalDetailsToConsole,
            markers: markers,
            error
         });
    }
}