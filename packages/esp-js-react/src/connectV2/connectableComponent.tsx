import {useRouter} from '../espRouterContext';
import {EspModelContext} from '../espModelContext';
import {Router} from 'esp-js';
import * as React from 'react';
import {connectWithSelector} from '../connectWithSelector';
import {createViewForModel} from '../viewBindingDecorator';
import {getRenderModel} from '../connectLegacy/connectableComponentCommon';

export type ConnectableComponentProps = {
    modelId?: string;
    viewContext?: string;
    view?: React.ComponentType;
    [key: string]: any;
};

interface ConnectableComponentChildProps {
    modelId: string;
    model: unknown;
    router: Router;
    [key: string]: any;
}

export const ConnectableComponent = ({modelId, viewContext, view,  ...rest}: ConnectableComponentProps) => {
    const router = useRouter();
    const model = connectWithSelector<unknown, unknown>(
        m => m,
        modelId,
        // Some models will be OO.
        // This means the reference will never change so we must always propagate updates at this level.
        // Other code down the tree will select the immutable bits of the graph and can stop further render propagation.
        (last, next) => false
    );
    if (model == null) {
        return null;
    }
    // Modern react doesn't really use older Higher Order Component patters, specifically:
    // * Consume your props, pass everything else down - typically done by extracting '...rest' props and pass them via cloned children.
    // * Pass cross-cutting props through the tree - typically done by massing props via cloned children.
    // However, given this code will work with legacy code, it's going do both.
    // Below, the EspModelContext, will provide a migration path as that exposes data via React context,
    // this will so code can move away from having to pass common props through the tree.
    let renderModel = getRenderModel(model);
    const childProps: ConnectableComponentChildProps = {
        modelId,
        router: router,
        ...rest,
        model: renderModel
    };
    let viewElement = createViewForModel(model, childProps, viewContext, view);
    return (
        <EspModelContext modelId={modelId} router={router} model={renderModel} {...childProps}>
            {viewElement}
        </EspModelContext>
    );
};