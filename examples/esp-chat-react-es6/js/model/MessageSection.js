import esp from 'esp-js';
import Message from './Message';

export default class MessageSection extends esp.model.DisposableBase {
    constructor(router, messageService) {
        super();
        this._router = router;
        this._messageService = messageService;
        this._sortedMessages = [];
        this._threadName = null;
        this._hasChanges = false;
    }
    get sortedMessages() {
        return this._sortedMessages;
    }
    get threadName() {
        return this._threadName;
    }
    get hasChanges() {
        return this._hasChanges;
    }
    initialise() {
        this.addDisposable(this._router.observeEventsOn(this));
    }
    _observe_ThreadSelected_commited(model, event) {
        this._updateMessages(model);
        this._threadName = event.threadName;
        this._hasChanges = true;
    };
    _observe_MessageSent(model, event) {
        this.addDisposable(
            this._messageService.sendMessage(event.text, model.selectedThreadId, model.messageSection.threadName)
                .subscribe(ack => {
                    /* ack received from send operation */
                })
        );
    };
    _observe_MessagesReceived(model) {
        this._updateMessages(model);
        this._hasChanges = true;
    }
    _updateMessages(model) {
        var rawMessages = model.rawMessagesByThreadId[model.selectedThreadId];
        var messages = rawMessages.map(rawMessage => {
            return new Message(
                rawMessage.id,
                rawMessage.authorName,
                rawMessage.text,
                new Date(rawMessage.timestamp));
        }).sort(function (a, b) {
            return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
        });
        this._sortedMessages = messages;
    };
}
