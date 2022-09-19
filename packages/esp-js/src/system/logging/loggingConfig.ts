import {CompositeSink, ConsoleSink} from './sinks';
import {GlobalState} from '../globalState';
import {Level, LogEvent, LogFormatter, LoggerConfig, Sink} from './types';
import {utils as u} from '../utils';

let _currentLevel: Level = Level.debug;
const _sink = new CompositeSink(new ConsoleSink());
const _loggerConfigs : {[key: string]: LoggerConfig} = {};
/**
 * A formatter that defaults to:
 * [YYYYMMDD][<level-shorthand>][<logger-name>] <text>
 * For example:
 * [20210915][D][MyLogger] Some Message
 *
 * This is exported as it may be easier to call this, then amend the output.
 * Ideally we'd have a proper tokenizer in place, but perhaps at a later date.
 */
export const DefaultFormatter: LogFormatter = (dateTime: Date, logEvent: LogEvent, loggerName: string, logText: string) => {
    if (logEvent.logInUTCTime) {
        return `[${dateTime.getUTCFullYear()}${u.pad10(dateTime.getUTCMonth() + 1)}${u.pad10(dateTime.getUTCDate())}][${u.pad10(dateTime.getUTCHours())}:${u.pad10(dateTime.getUTCMinutes())}:${u.pad10(dateTime.getUTCSeconds())}.${u.pad100(dateTime.getUTCMilliseconds())}][${u.getLogLevelShorthand(logEvent.level)}][${loggerName}] ${logText}`;
    } else {
        return `[${dateTime.getFullYear()}${u.pad10(dateTime.getMonth() + 1)}${u.pad10(dateTime.getDate())}][${u.pad10(dateTime.getHours())}:${u.pad10(dateTime.getMinutes())}:${u.pad10(dateTime.getSeconds())}.${u.pad100(dateTime.getMilliseconds())}][${u.getLogLevelShorthand(logEvent.level)}][${loggerName}] ${logText}`;
    }
};

const _defaultLoggerConfig: LoggerConfig = {
    dumpAdditionalDetailsToConsole: false,
    level: _currentLevel,
    padOrTruncateLoggerNameLengthTo: null,
    dateFactory: () => new Date(),
    logInUTCTime: false,
    formatter: DefaultFormatter
};

export const _getOrCreateLoggerConfig = (loggerName: string, overrides: Partial<LoggerConfig> = {}) => {
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

    static get rootSink(): Sink {
        return _sink;
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
     *
     * Replaces window.console's log, info, warn and error functions with a variants that sends logs to the _sink.
     * Note that the sink is a Composite sink so logs will still appear in the console via ConsoleSink.
     */
    static captureConsoleLogs(): void {
        const _log = (level: Level, ...args: any[]) => {
            LoggingConfig.rootSink.log({
                timestamp: new Date(),
                logger: 'Console',
                level: level,
                message: args,
                dumpAdditionalDetailsToConsole: true, // always dump these for console logs
                markers: null,
                error: null, // we don't support this for raw console logs,
                formatter: LoggingConfig.defaultLoggerConfig.formatter,
                logInUTCTime: LoggingConfig.defaultLoggerConfig.logInUTCTime,
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
    }

    static get defaultLoggerConfig(): LoggerConfig {
        return _defaultLoggerConfig;
    }

    static getLoggerConfig(loggerName: string): LoggerConfig {
        return _getOrCreateLoggerConfig(loggerName);
    }
}

declare global {
    interface Window { _esp: { LoggingConfig: LoggingConfig }; }
}

(<any>GlobalState)._esp = {
    LoggingConfig : LoggingConfig
};