import * as React from 'react';
import { Router } from 'esp-js';
import { BlotterModel } from '../models/blotterModel';
export declare class BlotterView extends React.Component<{
    model: BlotterModel;
    router: Router;
}, any> {
    render(): JSX.Element;
}
