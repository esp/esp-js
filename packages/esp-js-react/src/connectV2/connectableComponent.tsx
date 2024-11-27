import {useRouter} from '../espRouterContext';
import {EspModelContext} from '../espModelContext';
import {Logger, Router} from 'esp-js';
import * as React from 'react';
import {connectWithSelector} from '../connectWithSelector';
import {createViewForModel} from '../viewBindingDecorator';
import {ConnectableComponentLike, ConnectableComponentProps} from '../connectApi/types';
import {getRenderModel} from '../connectApi/connectableComponentCommon';

interface ConnectableComponentChildProps {
    modelId: string;
    model: unknown;
    router: Router;
    [key: string]: any;
}

const _log = Logger.create('ConnectableComponent');

export const ConnectableComponent: ConnectableComponentLike = ({modelId, viewContext, view, createPublishEventProps, mapModelToProps, ...rest}: ConnectableComponentProps) => {
    warnIfUsingLegacyProps(createPublishEventProps, mapModelToProps);
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

const warnIfUsingLegacyProps = (createPublishEventProps: any, mapModelToProps: any) => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    if (mapModelToProps || createPublishEventProps) {
        let stack: string | undefined = undefined;
        try {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error();
        } catch (e) {
            stack = (e as Error).stack;
        }
        _log.warn(
            `ConnectableComponent (new version) detected legacy props being passed, these will be ignored. ` +
            stack
        );
    }
};