import * as esp from 'esp-js';
import * as React from 'react';

export function viewBinding(view:any, displayContext?:string): any;

export interface RouterProviderProps {
    router: esp.Router;
}

export class RouterProvider extends React.Component<RouterProviderProps, {}> {
    constructor(props: any);
    render(): JSX.Element;
}

export interface SmartComponentProps {
    modelId: string;
    view?: any;
    viewContext?: string;
    [key: string]: any // other props which will be passed through to the SmartComponent's view
}

export class SmartComponent extends React.Component<SmartComponentProps, {}> {
    constructor(props: any);
    render(): JSX.Element;
}