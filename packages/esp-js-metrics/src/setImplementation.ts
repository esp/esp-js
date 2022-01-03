// Note there is webpack config so this file doesn't get re-written at bundle time.
// Without that, webpack would otherwise re-write what global and window may point to, defeating the purpose of GlobalState.

// need to 'null' check these a bit differently as they are globals, a standard `if (globalName){}` will throw if it's not defined.
const _hasWindow = typeof window !== 'undefined';
const _hasGlobal = typeof global !== 'undefined';

/**
 * Sets a metricsFactoryInstance which can be found via node, or the browser
 */
export const setMetricsFactoryInstance = (instance: any, forceSet: boolean) => {
    const instanceSet = _hasGlobal && global.metricsFactoryInstance || _hasWindow && window.metricsFactoryInstance;
    if (!forceSet && instanceSet) {
        return;
    }
    if (_hasGlobal) {
        global.metricsFactoryInstance = instance;
        // some APIs put window onto global, if that's the case set there too
        if (global.window) {
            global.window.metricsFactoryInstance = instance;
        }
    }
    if (_hasWindow) {
        window.metricsFactoryInstance = instance;
    }
};

/**
 * Gets a metricsFactoryInstance which can be found via node, or the browser
 */
export const getMetricsFactoryInstance = () => {
    if (_hasGlobal) {
        if (global.metricsFactoryInstance) {
            return global.metricsFactoryInstance;
        }
        if (global.window && global.window.metricsFactoryInstance) {
            return global.window.metricsFactoryInstance;
        }
    }
    if (_hasWindow && window.metricsFactoryInstance) {
        return window.metricsFactoryInstance;
    }
    throw new Error('Could not find a MetricsFactory implementation');
};