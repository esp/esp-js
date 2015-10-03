import esp from 'esp-js';

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
    _observeThreadSelected_commited(model, event) {
        this._updateMessages(model);
        model.messageSection.threadName = event.threadName;
        model.messageSection.hasChanges = true;
    };
    _observeMessageSent(model, event) {
        this.addDisposable(
            this._messageService.sendMessage(event.text, model.selectedThreadId, model.messageSection.threadName)
                .subscribe(results => {
                    this._router.runAction(() => {
                        this._updateMessages(model);
                        model.messageSection.hasChanges = true;
                        this._router.publishEvent("messagesReceived", { rawMessages: [ rawMessage ] });
                    });
                })
        );
    };
    _updateMessages(model) {
        var rawMessages = model.rawMessagesByThreadId[model.selectedThreadId];
        var messages = rawMessages.map(function (rawMessage) {
            return new entities.Message(
                rawMessage.id,
                rawMessage.authorName,
                rawMessage.text,
                new Date(rawMessage.timestamp));
        }).sort(function (a, b) {
            return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
        });
        model.messageSection.sortedMessages = messages;
    };
}
