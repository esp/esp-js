import {utils} from '../system';
import {Consts} from './index';

export function isModelChangedEventType(eventType: string | ModelChangedEventType): eventType is ModelChangedEventType {
    return (<ModelChangedEventType>eventType).eventType !== undefined &&
        (<ModelChangedEventType>eventType).modelId !== undefined &&
        (<ModelChangedEventType>eventType).eventType === Consts.modelChangedEvent;
}
export function isStringEventType(eventType: string | ModelChangedEventType): eventType is string {
    return utils.isString(eventType);
}
export type ModelChangedEventType =  { eventType: string, modelId: string };
export type EventType = string | ModelChangedEventType;