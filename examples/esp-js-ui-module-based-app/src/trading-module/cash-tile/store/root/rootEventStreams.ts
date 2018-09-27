import * as Rx from 'rx';
import {EspUiEventNames, EspUiEvents, RegionManager, Logger} from 'esp-js-ui';
import {OutputEvent, InputEventStreamFactory} from 'esp-js-polimer';
import { RootEvents } from '../../events';
import {CashTileStore} from '../cashTileStore';

const _log = Logger.create('CashTile-rootObservables');

const addToRegionEventStream = (getInputEventStreamFor: InputEventStreamFactory<RootEvents.BootstrapEvent, CashTileStore>): Rx.Observable<OutputEvent<EspUiEvents.AddToRegionEvent>> => {
    return getInputEventStreamFor(RootEvents.bootstrap).map(inputEvent => {
        _log.debug(`Processing bootstrap event`);
        return {
            eventType: EspUiEventNames.regions_regionManager_addToRegion,
            modelId: RegionManager.ModelId,
            event: <EspUiEvents.AddToRegionEvent> {
                regionName: inputEvent.store.rootState.regionName,
                regionItem: inputEvent.store.rootState.regionItem
            }
        };
    });
};

export const rootStateObservable = addToRegionEventStream;