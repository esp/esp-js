import {PolimerModel} from './polimerModel';
import {logger} from './logger';
import { Router, EventEnvelope, GlobalState } from 'esp-js';
import {ImmutableModel} from './immutableModel';

const devToolsExtension = GlobalState['devToolsExtension']; //tslint:disable-line
const _withDevTools = devToolsExtension != null;

type Update = {
    type: string;
    payload: any
};

const onDevToolsMessage = <T extends ImmutableModel>(router: Router, modelId: string, model: PolimerModel<T>, instance: any) =>
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
                    instance.init(model.getImmutableModel());
                    break;
                case 'JUMP_TO_STATE':
                case 'JUMP_TO_ACTION':
                    const state = JSON.parse(message.state);
                    throw new Error(`Not supported`);
                    break;
                default:
                    break;
            }
        }
    };

export const connectDevTools = <T extends ImmutableModel>(router: Router, modelId: string, model: PolimerModel<T>, instanceId: string) => {
    if (_withDevTools) {
        const options: any = {name: instanceId, instanceId};
        const instance = devToolsExtension.connect(options);

        instance.subscribe(onDevToolsMessage(router, modelId, model, instance));
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
