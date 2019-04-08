import * as React from 'react';
import { Router } from 'esp-js';
import { CashTileModel } from '../model/cashTileModel';
export declare class CashTileView extends React.Component<{
    model: CashTileModel;
    router: Router;
}, any> {
    constructor(props: any);
    _onCurrencyPairChanged: (event: any) => void;
    _onRequestRfq: () => void;
    _onNotionalChanged: (event: any) => void;
    _onDateInputBlur: (event: any) => void;
    _onDateInputChanged: (e: any) => void;
    _publishEvent: (event: any, payload: any) => void;
    render(): JSX.Element;
}
