import {Guard} from '../guard';
import {utils} from '../utils';
import {_getOrCreateLoggerConfig, LoggingConfig} from './loggingConfig';
import {Level, LoggerConfig, Markers} from './types';

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

export class Logger {
    constructor(
        private _name: string,
        private _loggerConfig: LoggerConfig
    ) {
    }

    public get name() {
        return this._name;
    }

    public get config() {
        return this._loggerConfig;
    }

    static create(name: string, loggerConfig: Partial<LoggerConfig> = {}): Logger {
        Guard.isDefined(name, 'The name argument should be defined');
        Guard.isString(name, 'The name argument should be a string');
        return new Logger(name, _getOrCreateLoggerConfig(name, loggerConfig));
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
    verbose(markers: Markers, message: string, additionalDetails?: any): void;
    verbose(...args: any[]) : void {
        if (this.isLevelEnabled(Level.verbose)) {
            this._log(Level.verbose, args);
        }
    }

    public isLevelEnabled(level: Level) : boolean {
        return getLevelNumber(this._loggerConfig.level) <= getLevelNumber(level);
    }

    /**
     * debug(message [, ...args]): expects a string log message and optional object to dump to console
     */
    debug(message: string, additionalDetails?: any): void;
    debug(markers:Markers, message: string, additionalDetails?: any): void;
    debug(...args: any[]) : void {
        if (this.isLevelEnabled(Level.debug)) {
            this._log(Level.debug, args);
        }
    }

    /**
     * info(message [, ...args]): expects a string log message and optional object to dump to console
     */
    info(message: string, additionalDetails?: any): void;
    info(markers:Markers, message: string, additionalDetails?: any): void;
    info(...args: any[]) : void {
        if (this.isLevelEnabled(Level.info)) {
            this._log(Level.info, args);
        }
    }

    /**
     * warn(message [, ...args]): expects a string log message and optional object to dump to console
     */
    warn(message: string, additionalDetails?: any): void;
    warn(markers:Markers, message: string, additionalDetails?: any): void;
    warn(...args: any[]) : void {
        if (this.isLevelEnabled(Level.warn)) {
            this._log(Level.warn, args);
        }
    }

    /**
     * error(message [, ...args]): expects a string log message and optional object to dump to console
     */
    error(message: string, error?: any): void;
    error(markers:Markers, message: string, error?: any): void;
    error(...args: any[]) : void {
        if (this.isLevelEnabled(Level.error)) {
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
        LoggingConfig.rootSink.log({
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