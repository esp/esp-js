import { Logger, Guard } from '../../core';
import LayoutMode from '../layoutMode';

const _log = Logger.create('StateService');

export default class StateService {
    saveApplicationState<T>(moduleKey:string, layoutMode:LayoutMode, state:T): void {
        Guard.isString(moduleKey, 'appKey must be a string');
        Guard.isDefined(layoutMode, 'layoutMode must be a defined');
        Guard.isDefined(state, 'state must be a defined');
        let stateJson = JSON.stringify(state);
        let stateKey = this._getStateKey(moduleKey, layoutMode);
        _log.debug(`saving layout state for key ${stateKey}. State:${stateJson}`, state);
        localStorage.setItem(stateKey, stateJson);
    }
    
    getApplicationState<T>(moduleKey:string, layoutMode:LayoutMode): T {
        Guard.isString(moduleKey, 'moduleKey must be a string');
        Guard.isDefined(layoutMode, 'layoutMode must be a defined');
        let stateKey = this._getStateKey(moduleKey, layoutMode);
        let state = localStorage.getItem(stateKey);
        return state ? JSON.parse(state) : null;
    }

    private _getStateKey(appKey:string, layoutMode:LayoutMode): string {
        return `${appKey}-${layoutMode.name}`;
    }
}
