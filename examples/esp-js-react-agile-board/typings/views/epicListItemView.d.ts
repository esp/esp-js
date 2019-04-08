import * as React from 'react';
import { Epic } from '../models/epic';
import { Router } from 'esp-js';
export interface EpicListItemViewProps {
    epic: Epic;
    router: Router;
}
export declare class EpicListItemView extends React.Component<EpicListItemViewProps, {}> {
    render(): JSX.Element;
}
