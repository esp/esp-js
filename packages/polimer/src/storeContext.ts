import {PolimerEventHandler, PolimerStateFactory} from './polimerState';
import {connect, sendUpdateToDevTools} from './tools/reduxDevToolsConnector';
import { EventEnvelope, Router } from 'esp-js';

type PolimerMapping = {
    [eventName: string]: PolimerEventHandler<any>[];
};

type KeysOf<TStore, TValue> = {
    [P in keyof TStore]: TValue
};

export type PolimerStore = {
    [key: string]: any
};

export class PolimerStoreContext<T> {
    private _polimerEventHandlers: PolimerMapping = {};

    constructor(
        private _store?: T,
        private _autoCommit: boolean = true,
        private readonly _storeName: string = 'ESP-JS'
    ) {}

    public initialize(router: Router, modelId: string) {
        connect(router, modelId, this, this._storeName);
        sendUpdateToDevTools('@@INIT', this.getStore(), this._storeName);
    }

    public addMapping = (handler: PolimerEventHandler<any>, events: string[]) => {
        events.forEach(event => {
            if (!(event in this._polimerEventHandlers)) {
                this._polimerEventHandlers[event] = [];
            }

            this._polimerEventHandlers[event].push(handler);
        });
    };

    public handleEvent = (eventData: EventEnvelope<any, any>) => {
        // We're observing every event in ESP and so it may happen that we don't have a handler
        // in any of the reducers
        if (eventData.eventType in this._polimerEventHandlers) {
            const handlers = this._polimerEventHandlers[eventData.eventType];
            handlers.forEach(handler => handler(eventData.eventType, eventData.event));
        }

        sendUpdateToDevTools(eventData, this.getStore(), this._storeName);

        if (this._autoCommit) {
            // As data mutation should happen exclusively in polimers, we're committing eventContext here
            // to allow model to observe events on post-commit stage. This way we have nice and clean way to perform
            // side-effects either pre- or post- store mutation.
            eventData.context.commit();
        }
    };

    public getStore = (): T => {
        return this._store;
    };

    public setStore = (value: T) => {
        this._store = value;
    }
}

export const createPolimerStore = <TStore>(storeObject: KeysOf<TStore, PolimerStateFactory<any, TStore>>) => {
    return (polimerStore: PolimerStoreContext<TStore>): TStore => {
        const stateNames = Object.keys(storeObject) as (keyof TStore)[];

        // This creates a JSON object holding all the states.
        return stateNames
            .reduce((aggregator, stateName) => {
                const stateFactory: PolimerStateFactory<any, TStore> = storeObject[stateName];
                aggregator[stateName] = stateFactory(polimerStore, stateName);

                return aggregator;
            }, {} as TStore);
    };
};
