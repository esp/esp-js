import esp from 'esp-js';
import Thread from './Thread'

export default class ThreadSection extends esp.model.DisposableBase {
    constructor(router) {
        super();
        this._router = router;
        this.threadsById = {};
        this.sortedThreads = [];
        this.unreadCount = {
            value: 0,
            isVisible: false
        };
        this.hasChanges = false;
    }
    initialise() {
        this.addDisposable(this._router.observeEventsOn(this));
    }
    preProcess() {
        this.hasChanges = false;
    }
    @esp.observeEvent('MessagesReceived')
    _observeMessagesReceived(event, context, model) {
        for (var i = 0; i < event.rawMessages.length; i++) {
            var rawMessage = event.rawMessages[i];
            var thread = _this.threadsById[rawMessage.threadId];
            var messageTime = new Date(rawMessage.timestamp);
            if (thread === undefined) {
                thread = new Thread(
                    rawMessage.threadId,
                    rawMessage.threadName,
                    messageTime,
                    rawMessage.text);
                _this.threadsById[rawMessage.threadId] = thread;
                _this.sortedThreads.push(thread);
            } else {
                if (thread.lastMessageTime <= messageTime) {
                    thread.lastMessageTime = messageTime;
                    thread.lastMessageText = rawMessage.text;
                }
            }
            if (thread.id === model.selectedThreadId) {
                thread.isRead = true;
            }
        }
        _this.sortedThreads.sort(function (a, b) {
            return a.lastMessageTime > b.lastMessageTime ? -1 : a.lastMessageTime < b.lastMessageTime ? 1 : 0;
        });
        _this._updateActiveFlags(model);
        _this._updateUnreadCount(model);
        _this.hasChanges = true;
    };
    @esp.observeEvent('ThreadSelected', esp.ObservationStage.committed)
    _observeThreadSelected(event, context, model) {
        _this.threadsById[model.selectedThreadId].isRead = true;
        _this._updateActiveFlags(model);
        _this._updateUnreadCount(model);
        _this.hasChanges = true;
    };
    _updateActiveFlags(model) {
        for (var i = 0; i < this.sortedThreads.length; i++) {
            var thread = this.sortedThreads[i];
            thread.isActive = thread.id === model.selectedThreadId;
        }
    };
    _updateUnreadCount() {
        var unreadCount = this.sortedThreads.reduce(function (total, thread) { return thread.isRead ? total : total + 1; }, 0);
        this.unreadCount.value = unreadCount;
        this.unreadCount.isVisible = unreadCount > 0;
    };
}