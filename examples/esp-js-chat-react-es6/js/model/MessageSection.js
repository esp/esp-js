import * as esp from 'esp-js';
import Message from './Message';

export default class MessageSection extends esp.DisposableBase {
    constructor(router, messageService) {
        super();
        this._router = router;
        this._messageService = messageService;
        this.sortedMessages = [];
        this.threadName = null;
        this.hasChanges = false;
    }
    initialise() {
        this.addDisposable(this._router.observeEventsOn(this));
    }
    preProcess() {
        this.hasChanges = false;
    }
    @esp.observeEvent('InitEvent', esp.ObservationStage.committed)
    _observeThreadSelected(event, context, model) {
        this._updateMessages(model);
        this.threadName = event.threadName;
        this.hasChanges = true;
    }
    @esp.observeEvent('MessageSent')
    _observeMessageSent(event, context, model) {
        this._messageService
            .sendMessage(event.text, model.selectedThreadId, model.messageSection.threadName)
            .subscribe(ack => {
                /* ack received from send operation */
            }
        );
    }
    @esp.observeEvent('MessagesReceived')
    _observeMessagesReceived(event, context, model) {
        this._updateMessages(model);
        this.hasChanges = true;
    }
    @esp.observeEvent('ThreadSelected',  esp.ObservationStage.committed)
    _observeThreadSelected(event, context, model) {
        this._updateMessages(model);
        this.threadName = event.threadName;
        this.hasChanges = true;
    };
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
        this.sortedMessages = messages;
    };
}
