import * as React from 'react';
import {ComponentType, useCallback, useMemo} from 'react';
import {CreatePublishEventProps, MapModelToProps} from '../connectLegacy/connectableComponent';
import {ConnectEqualityFn, connectWithSelector, defaultConnectEqualityFn} from '../connectWithSelector';
import {EspModelContext, PublishModelEventDelegate} from '../espModelContext';
import {useRouter} from '../espRouterContext';

export interface ConnectableComponentProps {
    modelId: string;
}

export type ConnectableComponentFactory = (view: React.ComponentType) => (props: ConnectableComponentProps) => React.JSX.Element;

export const connect = function <TModel, TPublishEventProps, TModelMappedToProps = {}>(
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>,
    mappedPropsEqualityFn: ConnectEqualityFn<TModelMappedToProps> = defaultConnectEqualityFn
): ConnectableComponentFactory {
    return (view: ComponentType) => {
        return (props: ConnectableComponentProps) => {
            const {modelId, ...rest} = props;
            const router = useRouter();
            const publishModelEvent: PublishModelEventDelegate = useCallback((eventType: string, event: any) => {
                router.publishEvent(modelId, eventType, event);
            }, [router, modelId]);
            const publishEventProps = useMemo(
                () => createPublishEventProps(publishModelEvent),
                [router, modelId]
            );
            const mappedProps = connectWithSelector<TModel, TModelMappedToProps>(
                model => mapModelToProps(model, publishEventProps),
                modelId,
                mappedPropsEqualityFn
            );
            // Here we're passing ...rest props down to the children.
            // This is an older pattern from Higher Order Components, i.e. 'consume your props, pass the rest down'.
            // It's not really used in modern React programming as hooks tend to solve the prop passing problem.
            // However, for backwards compatability it's being done here.
            const child = React.createElement(view, {...mappedProps, ...rest});
            // Note, the 'model' in this case is the mapped version
            return (
                <EspModelContext router={router} modelId={modelId} model={mappedProps}>
                    {child}
                </EspModelContext>
            );
        };
    };
};