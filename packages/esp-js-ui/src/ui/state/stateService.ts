import {Guard, Logger} from 'esp-js';

const _log = Logger.create('StateService');

export interface StateService {
    saveState<T>(key: string, state: T): void;
    getState<T>(key: string): T;
    clearState<T>(key: string): void;
}

export class LocalStorageStateService implements StateService {
    saveState<T>(key: string, state: T): void {
        Guard.isString(key, 'appKey must be a string');
        Guard.isDefined(state, 'state must be a defined');
        let stateJson = JSON.stringify(state);
        _log.debug(`saving layout state for key ${key}.`, state);
        localStorage.setItem(key, stateJson);
    }

    getState<T>(key: string): T {
        Guard.isString(key, 'key must be a string');
        let state = localStorage.getItem(key);
        return state ? JSON.parse(state) : null;
    }

    clearState<T>(key: string): void {
        Guard.isString(key, 'key must be a string');
        localStorage.removeItem(key);
    }

    /**
     * @deprecated Use `saveState()` instead.
     */
    public saveModuleState<T>(moduleKey:string, layoutMode:string, state:T): void {
        Guard.isString(moduleKey, 'appKey must be a string');
        Guard.isString(layoutMode, 'layoutMode must be a string');
        Guard.isDefined(state, 'state must be a defined');
        let stateJson = JSON.stringify(state);
        let stateKey = this._getStateKey(moduleKey, layoutMode);
        _log.debug(`saving layout state for key ${stateKey}.`, state);
        localStorage.setItem(stateKey, stateJson);
    }

    /**
     * @deprecated Use `getState()` instead.
     */
    public getModuleState<T>(moduleKey:string, layoutMode:string): T {
        Guard.isString(moduleKey, 'moduleKey must be a string');
        Guard.isDefined(layoutMode, 'layoutMode must be a defined');
        let stateKey = this._getStateKey(moduleKey, layoutMode);
        let state = localStorage.getItem(stateKey);
        return state ? JSON.parse(state) : null;
    }

    /**
     * @deprecated Use `clearState()` instead.
     */
    public clearModuleState<T>(moduleKey:string, layoutMode:string): void {
        Guard.isString(moduleKey, 'moduleKey must be a string');
        Guard.isDefined(layoutMode, 'layoutMode must be a defined');
        let stateKey = this._getStateKey(moduleKey, layoutMode);
        localStorage.removeItem(stateKey);
    }

    private _getStateKey(appKey:string, layoutMode:string): string {
        return `${appKey}-${layoutMode}`;
    }
}
