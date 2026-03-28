import React, {useContext, useMemo} from 'react';
import { ConnectableComponent } from './connectableComponent';
import { EspModulesContext } from './espModulesContext';

export interface RegionViewProps {
    regionName: string;
}

/**
 * Renders all view bindings registered for a given region across all loaded modules.
 *
 * Each module declares views with a region token (ModuleBuilder.withView in esp-js-ui).
 * RegionView reads EspModulesContext (populated by EspApp), finds all bindings
 * matching regionName, and mounts a ConnectableComponent for each.
 *
 * Example:
 *   const AppRoot = () => (
 *     <div>
 *       <RegionView regionName='main' />
 *       <RegionView regionName='sidebar' />
 *     </div>
 *   );
 */
export const RegionView = ({ regionName }: RegionViewProps) => {
    const modules = useContext(EspModulesContext);
    const bindings = useMemo(
        () => modules
            .flatMap(m => m.viewBindings)
            .filter(b => b.region === regionName),
        [modules, regionName]
    );
    return (
        <>
            {bindings.map(binding => (
                <ConnectableComponent
                    key={binding.storeId}
                    storeId={binding.storeId}
                    view={binding.viewComponent}
                />
            ))}
        </>
    );
};
