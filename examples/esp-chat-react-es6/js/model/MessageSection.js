import esp from 'esp-js';
import Message from './Message';

export default class MessageSection extends esp.model.DisposableBase {
    constructor(router, messageService) {
        super();
        this._router = router;
        this._messageService = messageService;
        this.sortedMessages = [];
        this.threadName = null;
        this.hasChanges = false;
    }
    initialise() {
        this._observeThreadSelected();
        this._observeMessageSent();
        this._observeMessagesReceived();
        this._observeThreadSelected();
    }
    preProcess() {
        this.hasChanges = false;
    }
    _observeThreadSelected() {
        this.addDisposable(
            this._router.getEventObservable('InitEvent', esp.ObservationStage.committed).observe((model, event) => {
                this._updateMessages(model);
                this.threadName = event.threadName;
                this.hasChanges = true;
            })
        );
    }
    _observeMessageSent() {
        var _this = this;
        this.addDisposable(
            this._router.getEventObservable('MessageSent').observe((model, event) => {
                _this._messageService
                    .sendMessage(event.text, model.selectedThreadId, model.messageSection.threadName)
                    .subscribe(ack => {
                        /* ack received from send operation */
                });
            })
        );
    }
    _observeMessagesReceived(model) {
        this.addDisposable(
            this._router.getEventObservable('MessagesReceived').observe((model) => {
                this._updateMessages(model);
                this.hasChanges = true;
            })
        );
    }
    _observeThreadSelected() {
        var _this = this;
        this.addDisposable(this._router.getEventObservable("ThreadSelected", esp.ObservationStage.commited).observe((model, event) => {
            _this._updateMessages(model);
            _this.threadName = event.threadName;
            _this.hasChanges = true;
        }));
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
