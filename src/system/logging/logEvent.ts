import {Level} from './level';

export interface LogEvent {
    logger: string;
    level: Level;
    message: string,
    args: any[]
}
