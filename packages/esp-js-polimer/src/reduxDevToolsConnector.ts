import {PolimerModel} from './polimerModel';
import {logger} from './logger';
import { Router, EventEnvelope } from 'esp-js';
import {Store} from './store';

const devToolsExtension = window['devToolsExtension']; //tslint:disable-line
const _withDevTools = typeof window !== 'undefined' && devToolsExtension != null;

type Update = {
    type: string;
    payload: any
};

const onDevToolsMessage = <T extends Store>(router: Router, modelId: string, storeContext: PolimerModel<T>, instance: any) =>
    (message: any) => {
        if (message.type === 'ACTION') {
            const event: EventEnvelope<any, any> = JSON.parse(message.payload);

            if (event.eventType == null) {
                logger.warn('Expected signature is {eventType: string, event: any}');
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

export const connect = <T extends Store>(router: Router, modelId: string, storeContext: PolimerModel<T>, instanceId: string) => {
    if (_withDevTools) {
        const options: any = {name: instanceId, instanceId};
        const instance = devToolsExtension.connect(options);

        instance.subscribe(onDevToolsMessage(router, modelId, storeContext, instance));
    }
};

export const sendUpdateToDevTools = (event: {eventType:string, event:any} | string, state: any, instanceId: string) => {
    if (_withDevTools) {
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
