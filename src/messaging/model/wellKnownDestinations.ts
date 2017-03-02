export default class WellKnownDestinations {
    static get heartbeat() : string {
        return '/exchange/response.exchange/status.heartbeat';
    }
}
