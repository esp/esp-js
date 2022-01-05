import * as React from 'react';
import {TradingPreferences} from '../model/tradingPreferences';
import {PublishModelEventContext, PublishModelEventDelegate} from 'esp-js-react';
import {TradingPreferencesEvents} from '../model/tradingPreferenceEvents';

export interface TradingPreferencesViewProps {
    model: TradingPreferences;
}

export const TradingPreferencesView = ({model}: TradingPreferencesViewProps) => {
    let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    const onDefaultPairChanged = (event) =>  publishEvent(TradingPreferencesEvents.defaultPairChanged, {pair: event.target.value} as TradingPreferencesEvents.DefaultPairChangedEvent);
    return (
        <div>
            <h3>Trading Preferences</h3>
            <p>
                Trading preferences here.
                This uses references data from the trading module.
            </p>

            Default Pair
            <select value={model.defaultPair} onChange={onDefaultPairChanged}>
                {model.pairs.map(p => (<option key={p} value={p}>{p}</option>))}
            </select>
        </div>
    );
};