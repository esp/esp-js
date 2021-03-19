import {Router} from 'esp-js';

export interface EspUiTestApi {
    removeModel();
    disposeModel();
    actor: Actor;
    model: TestImmutableModel;
    asserts: Asserts;
    router: Router;
}

export class Actor {
    constructor(private _modelId: string, private _router: Router) {
    }

    public publishEvent(eventType: string, event?: TestEvent) {
        event = event || {};
        this._router.publishEvent(this._modelId, eventType, event);
        return event;
    }
}

export class Asserts {
    constructor(private _router: Router) {
    }
}