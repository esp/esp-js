import {PolimerStoreContext} from '../storeContext';
import {logger} from './logger';
import { Router, EventEnvelope } from 'esp-js';

const devToolsExtension = window['devToolsExtension']; //tslint:disable-line
const withDevTools = typeof window !== 'undefined' && devToolsExtension != null;

type Update = {
    type: string;
    payload: any
};

const onDevToolsMessage = <T>(router: Router, modelId: string, storeContext: PolimerStoreContext<T>, instance: any) =>
    (message: any) => {
        if (message.type === 'ACTION') {
            const event: EventEnvelope<any, any> = JSON.parse(message.payload);

            if (event.eventType == null) {
                logger.warn('Expected signature is {eventName: string, event: any}');
                return;
            }

            router.publishEvent(modelId, event.eventType, event.event || {});
            return;
        }

        if (message.type === 'DISPATCH') {
            switch (message.payload.type) {
                case 'COMMIT':
                    instance.init(storeContext.getStore());
                    break;
                case 'JUMP_TO_STATE':
                case 'JUMP_TO_ACTION':
                    const state = JSON.parse(message.state);

                    router.runAction(modelId, () => storeContext.setStore(state));
                    break;
                default:
                    break;
            }
        }
    };

export const connect = <T>(router: Router, modelId: string, storeContext: PolimerStoreContext<T>, instanceId: string) => {
    if (withDevTools) {
        const options: any = {name: instanceId, instanceId};
        const instance = devToolsExtension.connect(options);

        instance.subscribe(onDevToolsMessage(router, modelId, storeContext, instance));
    }
};

export const sendUpdateToDevTools = (event: EventEnvelope<any, any> | string, state: any, instanceId: string) => {
    if (withDevTools) {
        const options = {name: instanceId};

        if (typeof event === 'string') {
            devToolsExtension.send({type: event}, state, options, instanceId);
        } else {
            // Update shape is mandated by the devtools
            const update: Update = {type: event.eventType, payload: event.event};
            devToolsExtension.send(update, state, options, instanceId);
        }
    }
};
