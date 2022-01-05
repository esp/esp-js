import * as React from 'react';
import {BlotterModel} from '../model/blotterModel';
import {BlotterEvents} from '../events';
import {PublishModelEventDelegate, PublishModelEventContext} from 'esp-js-react';

export interface BlotterViewProps {
    model:BlotterModel;
}

export const BlotterView = ({model}: BlotterViewProps) => {
    let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    const toggleIdSort: () => void = React.useCallback(() => {
        publishEvent(BlotterEvents.toggleIdSort, {});
    }, []);
    return (
        <div>
            <h4>Blotter</h4>
            <button onClick={toggleIdSort}>ID Sort ({model.sortType})</button>
            <table>
                <tbody>
                    {model.trades.map(t => (<tr key={t.id}><td>{t.id}</td><td>{t.account}</td></tr>))}
                </tbody>
            </table>
        </div>
    );
};