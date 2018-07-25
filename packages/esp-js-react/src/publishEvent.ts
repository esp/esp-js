import {Router} from 'esp-js';
export type PublishEvent = (type: string, event: any) => void;

export const publishEvent = (router: Router, modelId: string) => 
    (eventType: string, event: any) => router.publishEvent(modelId, eventType, event);