import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Router } from 'esp-js';
export interface RouterProviderProps {
    router: Router;
}
export declare class RouterProvider extends React.Component<RouterProviderProps, any> {
    static childContextTypes: {
        router: PropTypes.Validator<Router>;
    };
    getChildContext(): {
        router: Router;
    };
    render(): string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)> | React.ReactPortal;
}
