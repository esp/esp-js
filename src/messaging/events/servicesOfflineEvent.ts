export default class ServicesOfflineEvent {
    private _offlineServicesIdLookup:Object;

    constructor(offlineServicesIdLookup:Object) {
        this._offlineServicesIdLookup = offlineServicesIdLookup;
    }

    serviceIsOffline(serviceId:string):boolean {
        return this._offlineServicesIdLookup.hasOwnProperty(serviceId);
    }
}