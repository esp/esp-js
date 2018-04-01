// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

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

export function shouldUpdateMixin<TProps>(itemsThatEffectUpdateSelector: (nextProps: TProps) => any);

export type PublishEvent = (type: string, event: any) => void;
export function publishEvent(router: esp.Router, modelId: string);


export type MapPublishToProps<TPublishProps> = (publishEvent: PublishEvent) => TPublishProps;
export type MapModelToProps<TModel, TProps> = (model: TModel) => TProps;
export type ConnectableComponentProps = {
    modelId: string, 
    viewContext?: string
};

export function connect<TModel, TProps, TPublishProps>(modelSelector?: MapModelToProps<TModel, TProps>, mapPublish?: MapPublishToProps<TPublishProps>);

export interface Props<TModel, TProps, TPublishProps> extends ConnectableComponentProps {
    view?: React.ComponentClass | React.SFC;
    mapPublish?: MapPublishToProps<TPublishProps>;
    modelSelector?: MapModelToProps<TModel, TProps>;
    [key: string]: any;
}

export interface State {
    model?: any;
    publishProps?: any;
}

export class ConnectableComponent<TModel, TProps, TPublishProps> extends React.Component<Props<TModel, TProps, TPublishProps>, State> {}

export function createViewForModel(model, props, displayContext?): any;
export function shouldUpdateMixin<TProps>(itemsThatEffectUpdateSelector: (nextProps: TProps) => any): any;

export interface SmartComponentProps {
    modelId: string;
    view?: any;
    viewContext?: string;
    modelSelector?: (model: any) => any;
    [key: string]: any // other props which will be passed through to the SmartComponent's view
}

export interface SmartComponentState {
    model: any;
}

export class SmartComponent extends React.Component<SmartComponentProps, SmartComponentState> {
    constructor(props: SmartComponentProps);
    render(): JSX.Element;
}

export interface ModelSelectorProps {
    model: any;
    view: any;
    modelSelector: (props: any) => any;
}

export class ModelSelector extends React.Component<ModelSelectorProps, any> {
    constructor(props: any);
    render(): JSX.Element;
}
