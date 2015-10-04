import esp from 'esp-js';
import Thread from './Thread'

export default class ThreadSection extends esp.model.DisposableBase {
    constructor(router) {
        super();
        this._router = router;
        this._threadsById = {};
        this._sortedThreads = [];
        this._unreadCount = {
            value: 0,
            isVisible: false
        };
        this._hasChanges = false;
    }
    get threadsById() {
        return this._threadsById;
    }
    get sortedThreads() {
        return this._sortedThreads;
    }
    get unreadCount() {
        return this._unreadCount;
    }
    get hasChanges() {
        return this._hasChanges;
    }
    initialise() {
        this._observeMessagesReceived();
        this._observeThreadSelected();
    }
    preProcess() {
        this._hasChanges = false;
    }
    _observeMessagesReceived() {
        var _this = this;
        this.addDisposable(
            this._router.getEventObservable('MessagesReceived').observe((model, event) => {
                for (var i = 0; i < event.rawMessages.length; i++) {
                    var rawMessage = event.rawMessages[i];
                    var thread = _this._threadsById[rawMessage.threadId];
                    var messageTime = new Date(rawMessage.timestamp);
                    if (thread === undefined) {
                        thread = new Thread(
                            rawMessage.threadId,
                            rawMessage.threadName,
                            messageTime,
                            rawMessage.text);
                        _this._threadsById[rawMessage.threadId] = thread;
                        _this._sortedThreads.push(thread);
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
                _this._sortedThreads.sort(function (a, b) {
                    return a.lastMessageTime > b.lastMessageTime ? -1 : a.lastMessageTime < b.lastMessageTime ? 1 : 0;
                });
                _this._updateActiveFlags(model);
                _this._updateUnreadCount(model);
                _this._hasChanges = true;
            })
        );
    };
    _observeThreadSelected() {
        var _this = this;
        this.addDisposable(
            this._router.getEventObservable('ThreadSelected', esp.ObservationStage.committed).observe((model) => {
                _this._threadsById[model.selectedThreadId].isRead = true;
                _this._updateActiveFlags(model);
                _this._updateUnreadCount(model);
                _this._threadSection.hasChanges = true;
            })
        );
    };
    _updateActiveFlags(model) {
        for (var i = 0; i < this._sortedThreads.length; i++) {
            var thread = this._sortedThreads[i];
            thread.isActive = thread.id === model.selectedThreadId;
        }
    };
    _updateUnreadCount() {
        var unreadCount = this._sortedThreads.reduce(function (total, thread) { return thread.isRead ? total : total + 1; }, 0);
        this._unreadCount.value = unreadCount;
        this._unreadCount.isVisible = unreadCount > 0;
    };
}