// The logging APi was moved from esp-js-ui to esp-js.
// Import then re-export these logging class for backwards compatibility reasons.
import {
    CompositeSink,
    ConsoleSink,
    Level,
    LogEvent,
    Logger,
    LoggerConfig,
    LoggingConfig,
    Markers,
    Sink
} from 'esp-js';

export {
    CompositeSink,
    ConsoleSink,
    Level,
    LogEvent,
    Logger,
    LoggerConfig,
    LoggingConfig,
    Markers,
    Sink
};
// export {CompositeSink};
// export {ConsoleSink};
// export {Level};
// export {LogEvent};
// export {Logger};
// export {LoggerConfig};
// export {LoggingConfig};
// export {Markers};
// export {Sink};