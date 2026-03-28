import {EventBus} from 'esp-js';

export class EventBusSpy extends EventBus {
    private _modelSubscriptionCountByStoreId = new Map<string, number>();

    public getSubscriberCount(storeId: string) {
        return this._modelSubscriptionCountByStoreId.get(storeId);
    }

    public getModelObservable<TModel>(storeId: string) {
        const upstream = super.getModelObservable<TModel>(storeId);
        const self = this;
        return {
            subscribe(observer: any) {
                let c1 = self._modelSubscriptionCountByStoreId.get(storeId) || 0;
                c1++;
                self._modelSubscriptionCountByStoreId.set(storeId, c1);
                const subscription = upstream.subscribe(observer);
                return {
                    dispose() {
                        let c2 = self._modelSubscriptionCountByStoreId.get(storeId) || 0;
                        c2--;
                        self._modelSubscriptionCountByStoreId.set(storeId, c2);
                        subscription.dispose();
                    }
                };
            }
        } as any;
    }
}
