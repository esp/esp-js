import * as Rx from 'rxjs';
import {EspUiEventNames, EspUiEvents, RegionManager, Logger} from 'esp-js-ui';
import {InputEvent, OutputEvent, InputEventStreamFactory} from 'esp-js-polimer';
import { RootEvents } from '../../events';
import {CashTileModel} from '../cashTileModel';

const _log = Logger.create('CashTile-rootObservables');

const addToRegionEventStream = (getInputEventStreamFor: InputEventStreamFactory<CashTileModel, RootEvents.BootstrapEvent>): Rx.Observable<OutputEvent<EspUiEvents.AddToRegionEvent>> => {
    return getInputEventStreamFor(RootEvents.bootstrap).map((inputEvent: InputEvent<CashTileModel, RootEvents.BootstrapEvent>) => {
        _log.debug(`Processing bootstrap event`);
        return {
            eventType: EspUiEventNames.regions_regionManager_addToRegion,
            modelId: RegionManager.ModelId,
            event: <EspUiEvents.AddToRegionEvent> {
                regionName: inputEvent.model.rootState.regionName,
                regionItem: inputEvent.model.rootState.regionItem
            }
        };
    });
};

export const rootStateObservable = addToRegionEventStream;