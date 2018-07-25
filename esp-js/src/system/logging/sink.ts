import {LogEvent} from './logEvent';

export type Sink = (logEvent: LogEvent) => void;