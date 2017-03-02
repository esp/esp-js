import Guard from './guard';

export enum Level {
    verbose,
    debug,
    info,
    warn,
    error
};

// note: if you want verbose you need to change this explictly, this is just the initial default
let _currentLevel = Level.debug;

export type LogEvent = {
    logger: string,
    level: Level,
    color: string,
    args: IArguments
}

let _sink = (logEvent: LogEvent) => {
    let dateTime = new Date();
    const toLog = [`%c[${dateTime.toLocaleString()}.${dateTime.getMilliseconds()}][${Level[logEvent.level]}][${logEvent.logger}]`, `color:${logEvent.color}`];
    toLog.push.apply(toLog, logEvent.args);
    console.log.apply(console, toLog);
};

export default class Logger {
    private _name: string;

    constructor(name: string) {
        this._name = name;
    }

    static create(name: string): Logger {
        Guard.isDefined(name, 'The name argument should be defined');
        Guard.isString(name, 'The name argument should be a string');
        return new Logger(name);
    }

    static setLevel(level: Level): void {
        _currentLevel = level;
    }

    static setSink(sink: (logEvent: LogEvent) => {}): void {
        _sink = sink;
    }

    /**
     * verbose(message [, ...args]): expects a string log message and optional object to dump to console
     */
    verbose(message: string, objectToDumpToConsole?: any): void {
        if (_currentLevel <= Level.verbose) {
            this._log(Level.verbose, null, arguments);
        }
    }

    /**
     * debug(message [, ...args]): expects a string log message and optional object to dump to console
     */
    debug(message: string, objectToDumpToConsole?: any): void {
        if (_currentLevel <= Level.debug) {
            this._log(Level.debug, null, arguments);
        }
    }

    /**
     * info(message [, ...args]): expects a string log message and optional object to dump to console
     */
    info(message: string, objectToDumpToConsole?: any): void {
        if (_currentLevel <= Level.info) {
            this._log(Level.info, 'blue', arguments);
        }
    }

    /**
     * warn(message [, ...args]): expects a string log message and optional object to dump to console
     */
    warn(message: string, objectToDumpToConsole?: any): void {
        if (_currentLevel <= Level.warn) {
            this._log(Level.warn, 'orange', arguments);
        }
    }

    /**
     * error(message [, ...args]): expects a string log message and optional object to dump to console
     */
    error(message: string, objectToDumpToConsole?: any): void {
        if (_currentLevel <= Level.error) {
            this._log(Level.error, 'red', arguments);
        }
    }

    private _log(level: Level, color: string | null, args: IArguments): void {
        _sink({
            logger: this._name,
            level: level,
            color: color || 'black',
            args: args
         });
    }
}
