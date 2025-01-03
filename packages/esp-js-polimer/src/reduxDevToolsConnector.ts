import {PolimerModel} from './polimerModel';
import {logger} from './logger';
import {Router} from 'esp-js';
import {ImmutableModel} from './immutableModel';

// Redux Dev Tools API Docs:
// https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Methods.md

const devToolsExtension = (<any>window).__REDUX_DEVTOOLS_EXTENSION__; //tslint:disable-line
const _devToolsDetected = devToolsExtension != null;

type Update = {
    type: string;
    payload: any
};

export const devToolsDetected = () => {
    return _devToolsDetected;
};

const onDevToolsMessage = <T extends ImmutableModel>(router: Router, modelId: string, model: PolimerModel<T>, instance: any) =>
    (message: any) => {
        if (message.type === 'DISPATCH') {
            logger.warn(`ESP Redux DevTools is read-only. Message from the dev tools monitor will be ignored. Received message: [${JSON.stringify(message)}].`);
        }
    };

export const connectDevTools = <T extends ImmutableModel>(router: Router, modelId: string, model: PolimerModel<T>, instanceId: string) => {
    if (_devToolsDetected) {
        const options: any = {name: instanceId, instanceId};
        const instance = devToolsExtension.connect(options);
        const unsubscribe = instance.subscribe(onDevToolsMessage(router, modelId, model, instance));
        // This will unsubscribe the listener from dev tools, however, the state will still appear in dev tools.
        // That appears to be by design.
        // There is a devToolsExtension.disconnect(), but that un-wires all connected instances.
        return unsubscribe;
    }
    return () => {
    };
};

export const sendUpdateToDevTools = (event: { eventType: string, event: any }, state: any, instanceId: string) => {
    if (_devToolsDetected) {
        const options = {name: instanceId};
        const update: Update = {type: event.eventType, payload: event.event};
        devToolsExtension.send(update, state, options, instanceId);
    }
};
