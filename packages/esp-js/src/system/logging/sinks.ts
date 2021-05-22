import {GlobalState} from '../globalState';
import {utils} from '../utils';
import {LoggingConfig} from './loggingConfig';
import {Level, LogEvent, Sink} from './types';

const consoleInfo = GlobalState.console.log.bind(GlobalState.console);
const consoleWarn = GlobalState.console.warn.bind(GlobalState.console);
const consoleError = GlobalState.console.error.bind(GlobalState.console);

export class ConsoleSink implements Sink {
    public log(logEvent: LogEvent) : void {
        let dateTime = LoggingConfig.defaultLoggerConfig.dateFactory();
        let logText: string;
        let additionalArgs = null;
        if (messageIsString(logEvent.message)) {
            logText = logEvent.message;
        } else {
            logText = logEvent.message[0];
            // copy the incoming array
            additionalArgs = logEvent.message.slice();
            // now remove the message since we just captured it above as logText
            additionalArgs.splice(0, 1);
        }
        const loggerName = LoggingConfig.defaultLoggerConfig.padOrTruncateLoggerNameLengthTo === null
            ? logEvent.logger
            : padOrTruncate(logEvent.logger, LoggingConfig.defaultLoggerConfig.padOrTruncateLoggerNameLengthTo);
        let logLine = this._getLogLine(dateTime, logEvent, loggerName, logText);
        // The below could be simplified by pushing markers into a new array along with additionalDetails.
        // However given the amount of times logs are written the below doesn't allocate anything extra
        const hasMarkers = logEvent.markers && Object.keys(logEvent.markers).length;
        if (logEvent.level === Level.error) {
            if (hasMarkers) {
                consoleError(logLine, logEvent.markers, logEvent.error);
            } else {
                consoleError(logLine, logEvent.error);
            }
        } else if (logEvent.level === Level.warn) {
            if (logEvent.dumpAdditionalDetailsToConsole) {
                if (hasMarkers) {
                    consoleWarn(logLine, logEvent.markers, ...additionalArgs);
                } else {
                    consoleWarn(logLine, ...additionalArgs);
                }
            } else {
                consoleWarn(logLine);
            }
        } else {
            if (logEvent.dumpAdditionalDetailsToConsole) {
                if (hasMarkers) {
                    consoleInfo(logLine, logEvent.markers, ...additionalArgs);
                } else {
                    consoleInfo(logLine, ...additionalArgs);
                }
            } else {
                consoleInfo(logLine);
            }
        }
    }
    private _getLogLine(dateTime: Date, logEvent: LogEvent, loggerName: string, logText: string) {
        if (LoggingConfig.defaultLoggerConfig.logInUTCTime) {
            return `[${dateTime.getUTCFullYear()}${pad10(dateTime.getUTCMonth() + 1)}${pad10(dateTime.getUTCDate())}][${pad10(dateTime.getUTCHours())}:${pad10(dateTime.getUTCMinutes())}:${pad10(dateTime.getUTCSeconds())}.${pad100(dateTime.getUTCMilliseconds())}][${getLevelShorthand(logEvent.level)}][${loggerName}] ${logText}`;
        } else {
            return `[${dateTime.getFullYear()}${pad10(dateTime.getMonth() + 1)}${pad10(dateTime.getDate())}][${pad10(dateTime.getHours())}:${pad10(dateTime.getMinutes())}:${pad10(dateTime.getSeconds())}.${pad100(dateTime.getMilliseconds())}][${getLevelShorthand(logEvent.level)}][${loggerName}] ${logText}`;
        }
    }
}

export class CompositeSink implements Sink {
    private _sinks: Array<Sink>;

    constructor(...sinks: Array<Sink>) {
        this._sinks = sinks;
    }
    public log(logEvent: LogEvent) : void {
        this._sinks.forEach(s => s.log(logEvent));
    }
    public addSinks(...sinks:Array<Sink>) {
        this._sinks.push(...sinks);
    }
    public clearSinks() {
        this._sinks.length = 0;
    }
}

const pad10 = (n: number) => {
    return n < 10 ? '0'+n : n;
};

const pad100 = (n: number) => {
    if (n < 10) { return '00'+n; }
    if (n < 100) { return '0'+n; }
    return n;
};

const padOrTruncate = (v: string, length: number) => {
    if (v.length === length) {
        return v;
    }
    if (v.length > length) {
        return v.substring(0, length);
    }
    return v.padEnd(length);
};

const messageIsString = (message: string | any[]): message is string => {
    return utils.isString(message);
};

const getLevelShorthand = (level: Level) => {
    switch (level) {
        case Level.verbose:
            return 'V';
        case Level.debug:
            return 'D';
        case Level.info:
            return 'I';
        case Level.warn:
            return 'W';
        case Level.error:
            return 'E';
        case Level.none:
            return '';
        default:
            throw new Error(`Unknown level ${level}`);
    }
};
