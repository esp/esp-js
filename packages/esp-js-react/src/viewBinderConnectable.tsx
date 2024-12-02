import {useRouter} from './espRouterContext';
import {EspModelContext} from './espModelContext';
import {Logger, Router} from 'esp-js';
import * as React from 'react';
import {useModelSelector} from './useModelSelector';
import {createViewForModel} from './viewBindingDecorator';
import {tryGetRenderModel} from './polimer/getEspReactRenderModel';

const _log = Logger.create('ViewBinderConnectable');

export interface ViewBinderConnectableProps {
    modelId?: string;
    viewContext?: string;
    view?: React.ComponentType;
}

interface ViewBinderConnectableChildProps {
    modelId: string;
    model: object;
    router: Router;
}

/**
 * Dynamically binds a view found via @viewBinder(SomeJsXView) to a model managed by the Router.
 * Optionally provide a view override and/or a viewContext
 * @param modelId
 * @param viewContext
 * @param view
 * @constructor
 */
export const ViewBinderConnectable = ({modelId, viewContext, view}: ViewBinderConnectableProps) => {
    const router = useRouter();
    const model = useModelSelector<object, object>(
        m => m,
        modelId,
        false
    );
    if (!model) {
        return null;
    }
    let renderModel = tryGetRenderModel<object>(model);
    const childProps: ViewBinderConnectableChildProps = {
        modelId,
        router: router,
        model: renderModel
    };
    let viewElement = createViewForModel(model, childProps, viewContext, view);
    return (
        <EspModelContext modelId={modelId} router={router} model={renderModel} {...childProps}>
            {viewElement}
        </EspModelContext>
    );
};