import esp from 'esp-js';

export default class ChatAppModel extends esp.model.DisposableBase {
    constructor(messageService, router) {
        super();
        this._messageService = messageService;
        this._router = router;
        this._rawMessagesByThreadId = {};
        this._selectedThreadId = null;
        this._threadSection = {
            threadsById: {},
            sortedThreads: [],
            unreadCount: {
                value: 0,
                isVisible: false
            },
            hasChanges: false
        };
        this._messageSection = {
            sortedMessages: [],
            threadName: null,
            hasChanges: false
        };
    }
    get rawMessagesByThreadId() {
        return this._rawMessagesByThreadId;
    }
    get selectedThreadId() {
        return this._selectedThreadId;
    }
    get threadSection() {
        return this._threadSection;
    }
    get messageSection() {
        return this._messageSection;
    }
    initialise() {
        this.messageSubscription = new MessageSubscription();
        this.addDisposable(this._messageService);


        this.addDisposable(_router.observeEventsOn(this));
    }
    preProcess() {
        this.messageSection.hasChanges = false;
        this.threadSection.hasChanges = false;
    }
    _observeInitEvent() {
        this.messageSubscription.start();
    }
    _observeMessagesReceived(model, event, eventContext) {
        for (var i = 0; i < event.rawMessages.length; i++) {
            var rawMessage = event.rawMessages[i];
            var threadRawMessages = model.rawMessagesByThreadId[rawMessage.threadId] || [];
            threadRawMessages.push(rawMessage);
            model.rawMessagesByThreadId[rawMessage.threadId] = threadRawMessages;
        }
        if (model.selectedThreadId === null && event.rawMessages.length > 0) {
            model.selectedThreadId = event.rawMessages[0].threadId;
        }
        eventContext.commit();
    }
    _observeThreadSelected(model, event, eventContext) {
        model.selectedThreadId = event.threadId;
        eventContext.commit();
    }
}
