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

import * as React from 'react';
import { createViewForModel } from './viewBindingDecorator';
import {useRouter} from './routerProvider';

export interface SmartComponentProps {
    modelId: string;
    view?: any;
    viewContext?: string;
    modelSelector?: (model: any) => any;
    [key: string]: any; // other props which will be passed through to the SmartComponent's view
}

export interface SmartComponentState {
    model: any;
}

export class SmartComponent extends React.Component<SmartComponentProps, SmartComponentState> {
    private _currentObservingModelId = false;
    private _observationSubscription = null;

    componentWillReceiveProps(nextProps: SmartComponentProps) {
        this._tryObserveModel(nextProps.modelId);
    }
    componentWillMount() {
        this._tryObserveModel(this.props.modelId);
    }
    componentWillUnmount() {
        this._tryDisposeObservationSubscription();
    }
    _tryObserveModel(modelId) {
        if(!modelId) {
            this._tryDisposeObservationSubscription();
            this.setState({model: null});
        } else if (modelId !== this._currentObservingModelId) {
            this._tryDisposeObservationSubscription();
            this._currentObservingModelId = modelId;
            this._observationSubscription = useRouter()
                .getModelObservable(modelId)
                .map(model => {
                    return this.props.modelSelector
                        ? this.props.modelSelector(model)
                        : model;
                })
                .subscribe(model => {
                    this.setState({model: model});
                });
        }
    }
    _tryDisposeObservationSubscription() {
        this._currentObservingModelId = null;
        if(this._observationSubscription) {
            this._observationSubscription.dispose();
        }
    }
    render() {
        if(this.state.model) {
            return createViewForModel(this.state.model, this._getChildProps(), this.props.viewContext, this.props.view);
        }
        return null; // this (in react 15) will render a 'comment node' rather than any actual html
    }
    _getChildProps() {
        // 'consume' the props we own, pass the rest down
        let {modelId, viewContext, view, modelSelector, ...other} = this.props;
        let newProps = {
            model: this.state.model,
            router: useRouter()
        };
        return Object.assign({}, newProps, other);
    }
} 