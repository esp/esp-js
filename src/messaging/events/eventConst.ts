export default class EventConst {
    static get initEvent(): string {
        return 'initEvent';
    }

    static get connectEvent(): string {
        return 'connectEvent';
    }

    static get disconnectEvent(): string {
        return 'disconnectEvent';
    }

    static get streamEvent(): string {
        return 'streamEvent';
    }

    static get streamDisposedEvent(): string {
        return 'streamDisposedEvent';
    }

    static get rabbitMqConnectedEvent(): string {
        return 'rabbitMqConnectedEvent';
    }

    static get rabbitMqDisconnectedEvent(): string {
        return 'rabbitMqDisconnectedEvent';
    }

    static get rabbitMqMessageReceivedEvent(): string {
        return 'rabbitMqMessageReceivedEvent';
    }

    static get timerEvent(): string {
        return 'timerEvent';
    }

    static get serviceOnlineEvent(): string {
        return 'serviceOnlineEvent';
    }

    static get servicesOfflineEvent(): string {
        return 'servicesOfflineEvent';
    }

    static get setSessionIdEvent(): string {
        return 'setSessionIdEvent';
    }

    static get setIsAuthenticated(): string {
        return 'setIsAuthenticated';
    }

    static get clearSessionIdEvent(): string {
        return 'clearSessionIdEvent';
    }
}
