import * as esp from 'esp-js';
import * as React from 'react';
import * as PropTypes from 'prop-types';
export interface ViewBinderProps {
    model: any;
    viewContext: string;
}
export declare class ViewBinder extends React.Component<ViewBinderProps> {
    static contextTypes: {
        router: PropTypes.Validator<esp.Router>;
    };
    render(): React.ReactElement<{}, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
}
