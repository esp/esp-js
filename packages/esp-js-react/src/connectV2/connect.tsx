import * as React from 'react';
import {ComponentType, useCallback, useMemo} from 'react';
import {ConnectEqualityFn, ConnectableComponentFactory, ConnectableComponentProps, CreatePublishEventProps, MapModelToProps, ConnectFn} from '../connectApi/types';
import {connectWithSelector, defaultConnectEqualityFn} from '../connectWithSelector';
import {EspModelContext, PublishModelEventDelegate} from '../espModelContext';
import {useRouter} from '../espRouterContext';

export const connect = <TModel, TPublishEventProps, TModelMappedToProps = {}>(
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>,
    mappedPropsEqualityFn: ConnectEqualityFn<TModelMappedToProps> = defaultConnectEqualityFn
): ConnectableComponentFactory<TModel, TPublishEventProps, TModelMappedToProps> => {
    return (view: ComponentType) => {
        return (props: ConnectableComponentProps) => {
            const {modelId} = props;
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
            const child = React.createElement(
                view,
                {...mappedProps, ...extractPropsForChild(props) }
            );
            // Note, the 'model' in this case is the mapped version
            return (
                <EspModelContext modelId={modelId} model={mappedProps}>
                    {child}
                </EspModelContext>
            );
        };
    };
};

/**
 * THis function extracts the ...rest props to pass down to the children.
 * This is an older pattern from Higher Order Components, i.e. 'consume your props, pass the rest down'.
 * It's not really used in modern React programming as hooks tend to solve the prop passing problem.
 * However, for backwards compatability it's being done here.
 */
const extractPropsForChild = (props: ConnectableComponentProps) => {
    const {
        modelId,
        mapModelToProps,
        createPublishEventProps,
        view,
        viewContext,
        ...rest  } = props;
    return rest;
};