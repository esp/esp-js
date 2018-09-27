import {Guard} from 'esp-js';
import *  as Utils from './utils';

export enum Level {
    verbose = 'verbose',
    debug = 'debug',
    info = 'info',
    warn = 'warn',
    error = 'error',
    none = 'none'
}

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
    color: string,
    message: string;
    additionalDetails: any[];
    dumpAdditionalDetailsToConsole: boolean;
    markers: Markers;
};

export interface Sink {
    log(logEvent:LogEvent): void;
}

export class ConsoleSink implements Sink {
    public log(logEvent: LogEvent) : void {
        let dateTime = new Date();
        let message = `[${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}.${dateTime.getMilliseconds()}][${Level[logEvent.level]}][${logEvent.logger}] ${logEvent.message}`;
        if(logEvent.markers && Object.keys(logEvent.markers).length) {
            if(logEvent.dumpAdditionalDetailsToConsole) {
                console.log(message, logEvent.markers, ...logEvent.additionalDetails);
                return;
            } else {
                console.log(message);
            }
        } else {
            if(logEvent.dumpAdditionalDetailsToConsole) {
                console.log(message, ...logEvent.additionalDetails);
                return;
            } else {
                console.log(message);
            }
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
}

// note: if you want verbose you need to change this explicitly, this is just the initial default
let _currentLevel = Level.debug;
let _sink = new CompositeSink(new ConsoleSink());
let _loggerConfigs : {[key: string]: LoggerConfig} = {};

export interface LoggerConfig {
    dumpAdditionalDetailsToConsole: boolean;
    level: Level;
}

function getOrCreateLoggerConfig(loggerName: string) {
    let loggerConfig = _loggerConfigs[loggerName];
    if (!loggerConfig) {
        loggerConfig = Object.create(LoggingConfig.defaultLoggerConfig, {});
        _loggerConfigs[loggerName] = loggerConfig;
    }
    return loggerConfig;
}

export class LoggingConfig {
    private static _defaultLoggerConfig = { dumpAdditionalDetailsToConsole:true, level: _currentLevel };

    static setLevel(level: Level): void {
        _currentLevel = level;
        LoggingConfig._defaultLoggerConfig.level = _currentLevel;
    }

    static addSinks(...sink: Array<Sink>): void {
        _sink.addSinks(...sink);
    }
    static get defaultLoggerConfig()  : LoggerConfig {
        return LoggingConfig._defaultLoggerConfig;
    }
    static getLoggerConfig(loggerName: string): LoggerConfig {
        return getOrCreateLoggerConfig(loggerName);
    }
}

declare global {
    interface Window { _esp: { LoggingConfig:LoggingConfig }; }
}

(<any>window)._esp = {
    LoggingConfig : LoggingConfig
};

export class Logger {
    constructor(
        private _name: string,
        private _loggerConfig: LoggerConfig
    ) {
    }

    static create(name: string): Logger {
        Guard.isDefined(name, 'The name argument should be defined');
        Guard.isString(name, 'The name argument should be a string');

        let loggerConfig = getOrCreateLoggerConfig(name);
        return new Logger(name, loggerConfig);
    }

    group(...args: any[]) {
        console.group(...args);
    }

    groupCollapsed(...args: any[]) {
        console.groupCollapsed(...args);
    }

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
            this._log(Level.verbose, null, args);
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
            this._log(Level.debug, null, args);
        }
    }

    /**
     * info(message [, ...args]): expects a string log message and optional object to dump to console
     */
    info(message: string, additionalDetails?: any): void;
    info(markers:Markers, message: string, additionalDetails?: any): void;
    info(...args: any[]) : void {
        if (this._isLevelEnabled(Level.info)) {
            this._log(Level.info, 'blue', args);
        }
    }

    /**
     * warn(message [, ...args]): expects a string log message and optional object to dump to console
     */
    warn(message: string, additionalDetails?: any): void;
    warn(markers:Markers, message: string, additionalDetails?: any): void;
    warn(...args: any[]) : void {
        if (this._isLevelEnabled(Level.warn)) {
            this._log(Level.warn, 'orange', args);
        }
    }

    /**
     * error(message [, ...args]): expects a string log message and optional object to dump to console
     */
    error(message: string, additionalDetails?: any): void;
    error(markers:Markers, message: string, additionalDetails?: any): void;
    error(...args: any[]) : void {
        if (this._isLevelEnabled(Level.error)) {
            this._log(Level.error, 'red', args);
        }
    }

    private _log(level: Level, color: string | null, args: any[]): void {

        let markers : Markers = {};
        let message : string;
        let additionalDetails : any[];

        if(!Utils.isString(args[0])) {
            markers = args[0];
            message = args[1];
            additionalDetails = args.splice(2, args.length - 2);
        } else {
            message = args[0];
            additionalDetails = args.splice(1, args.length - 1);
        }

        _sink.log({
            timestamp: new Date(),
            logger: this._name,
            level: level,
            color: color || 'black',
            message: message,
            additionalDetails: additionalDetails,
            dumpAdditionalDetailsToConsole: this._loggerConfig.dumpAdditionalDetailsToConsole,
            markers: markers
         });
    }
}
