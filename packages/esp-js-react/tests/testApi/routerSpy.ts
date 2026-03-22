import {Router} from 'esp-js';

export class RouterSpy extends Router {
    private _modelSubscriptionCountByModelId = new Map<string, number>();

    public getSubscriberCount(modelId: string) {
        return this._modelSubscriptionCountByModelId.get(modelId);
    }

    public getModelObservable<TModel>(modelId: string) {
        const upstream = super.getModelObservable<TModel>(modelId);
        const self = this;
        return {
            subscribe(observer: any) {
                let c1 = self._modelSubscriptionCountByModelId.get(modelId) || 0;
                c1++;
                self._modelSubscriptionCountByModelId.set(modelId, c1);
                const subscription = upstream.subscribe(observer);
                return {
                    dispose() {
                        let c2 = self._modelSubscriptionCountByModelId.get(modelId) || 0;
                        c2--;
                        self._modelSubscriptionCountByModelId.set(modelId, c2);
                        subscription.dispose();
                    }
                };
            }
        } as any;
    }
}
