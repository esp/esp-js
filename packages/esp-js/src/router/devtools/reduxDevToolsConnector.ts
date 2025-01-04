import {Logger} from '../../system/logging/logger';

// Redux Dev Tools API Docs:
// https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Methods.md

export const logger = Logger.create('EspDevToolsConnector');

const devToolsExtension = (<any>window).__REDUX_DEVTOOLS_EXTENSION__; //tslint:disable-line

const _reduxDevToolsDetectedAndEnabledInEsp = (() => {
    try {
        if (devToolsExtension == null) {
            return false;
        }
        const url = new URL(window.location.href);
        if (url.searchParams.has('enableReduxDevToolsForEsp')) {
            let enableReduxDevToolsForEsp = url.searchParams.get('enableReduxDevToolsForEsp').toLowerCase().trim();
            if (enableReduxDevToolsForEsp === '' || enableReduxDevToolsForEsp === 'true') {
                return true;
            }
        }
    } catch(e: any) { }
    return false;
})();

/**
 * This is an internal ESP API for Redux Dev Tools Connectivity
 */
export const reduxDevToolsDetectedAndEnabledInEsp = () => {
    return _reduxDevToolsDetectedAndEnabledInEsp;
};

/**
 * This is an internal ESP API for Redux Dev Tools Connectivity
 */
export const connectReduxDevTools = (instanceId: string) => {
    if (_reduxDevToolsDetectedAndEnabledInEsp) {
        const options: any = {name: instanceId, instanceId};
        const instance = devToolsExtension.connect(options);
        const unsubscribe = instance.subscribe(
            (message: any) => {
                if (message.type === 'DISPATCH') {
                    logger.warn(`ESP Redux DevTools is read-only. Message from the dev tools monitor will be ignored. Received message: [${JSON.stringify(message)}].`);
                }
            }
        );
        // This will unsubscribe the listener from dev tools, however, the state will still appear in dev tools.
        // That appears to be by design.
        // There is a devToolsExtension.disconnect(), but that un-wires all connected instances.
        return unsubscribe;
    }
    return () => {
    };
};

// Conforms to the Redux update format
type Update = {
    type: string;
    payload: any
};

/**
 * This is an internal ESP API for Redux Dev Tools Connectivity
 */
export const sendUpdateToReduxDevTools = (event: { eventType: string, event: any }, state: any, instanceId: string) => {
    if (_reduxDevToolsDetectedAndEnabledInEsp) {
        const options = {name: instanceId};
        const update: Update = {type: event.eventType, payload: event.event};
        devToolsExtension.send(update, state, options, instanceId);
    }
};
