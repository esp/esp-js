import {CompositeSink, ConsoleSink} from './sinks';
import {GlobalState} from '../globalState';
import {Level, LoggerConfig, Sink} from './types';

const _sink = new CompositeSink(new ConsoleSink());
const _loggerConfigs : {[key: string]: LoggerConfig} = {};
let _currentLevel: Level = Level.debug;

const _defaultLoggerConfig: LoggerConfig = {
    dumpAdditionalDetailsToConsole: false,
    level: _currentLevel,
    padOrTruncateLoggerNameLengthTo: null,
    dateFactory: () => new Date(),
    logInUTCTime: false
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