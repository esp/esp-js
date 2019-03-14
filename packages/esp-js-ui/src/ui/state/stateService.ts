import {Guard} from 'esp-js';
import { Logger } from '../../core';
const _log = Logger.create('StateService');

export class StateService {
    public saveModuleState<T>(moduleKey:string, layoutMode:string, state:T): void {
        Guard.isString(moduleKey, 'appKey must be a string');
        Guard.isString(layoutMode, 'layoutMode must be a string');
        Guard.isDefined(state, 'state must be a defined');
        let stateJson = JSON.stringify(state);
        let stateKey = this._getStateKey(moduleKey, layoutMode);
        _log.debug(`saving layout state for key ${stateKey}. State:${stateJson}`, state);
        localStorage.setItem(stateKey, stateJson);
    }

    public getModuleState<T>(moduleKey:string, layoutMode:string): T {
        Guard.isString(moduleKey, 'moduleKey must be a string');
        Guard.isDefined(layoutMode, 'layoutMode must be a defined');
        let stateKey = this._getStateKey(moduleKey, layoutMode);
        let state = localStorage.getItem(stateKey);
        return state ? JSON.parse(state) : null;
    }

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
