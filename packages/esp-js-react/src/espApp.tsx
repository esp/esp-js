import React from 'react';
import type { App } from 'esp-js-ui';
import { EspEventBusContextProvider } from './espEventBusContextProvider';
import { EspModulesContext } from './espModulesContext';

export interface EspAppProps {
    app: App;
    children: React.ReactNode;
}

/**
 * Wraps an application root with the ESP context providers.
 *
 * Provides the EventBus (via EspEventBusContextProvider) and the loaded
 * modules list (via EspModulesContext) so that RegionView and any
 * esp-js-react hooks work without additional setup in the root component.
 *
 * Multiple EspApp instances can be mounted independently in the same DOM
 * for multi-app scenarios.
 *
 * Example:
 *   await app.start();
 *   ReactDOM.createRoot(document.getElementById('root')).render(
 *     <EspApp app={app}>
 *       <AppShell />
 *     </EspApp>
 *   );
 */
export const EspApp = ({ app, children }: EspAppProps) => (
    <EspEventBusContextProvider bus={app.eventBus}>
        <EspModulesContext.Provider value={app.modules}>
            {children}
        </EspModulesContext.Provider>
    </EspEventBusContextProvider>
);
