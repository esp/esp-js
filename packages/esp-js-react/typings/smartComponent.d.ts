import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Router } from 'esp-js';
export interface SmartComponentProps {
    modelId: string;
    view?: any;
    viewContext?: string;
    modelSelector?: (model: any) => any;
    [key: string]: any;
}
export interface SmartComponentState {
    model: any;
}
export declare class SmartComponent extends React.Component<SmartComponentProps, SmartComponentState> {
    private _currentObservingModelId;
    private _observationSubscription;
    static contextTypes: {
        router: PropTypes.Validator<Router>;
    };
    componentWillReceiveProps(nextProps: SmartComponentProps): void;
    componentWillMount(): void;
    componentWillUnmount(): void;
    _tryObserveModel(modelId: any): void;
    _tryDisposeObservationSubscription(): void;
    render(): React.ReactElement<{}, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
    _getChildProps(): {
        model: any;
        router: any;
    } & {
        readonly [x: string]: any;
        children?: React.ReactNode;
    };
}
