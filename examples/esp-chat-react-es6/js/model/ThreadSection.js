import Thread from './Thread'

export default class ThreadSection {
    constructor(router) {
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
    _observeMessagesReceived_commited(model, event) {
        for (var i = 0; i < event.rawMessages.length; i++) {
            var rawMessage = event.rawMessages[i];
            var thread = this._threadsById[rawMessage.threadId];
            var messageTime = new Date(rawMessage.timestamp);
            if (thread === undefined) {
                thread = new Thread(
                    rawMessage.threadId,
                    rawMessage.threadName,
                    messageTime,
                    rawMessage.text);
                this._threadsById[rawMessage.threadId] = thread;
                this._sortedThreads.push(thread);
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
        this._sortedThreads.sort(function (a, b) {
            return a.lastMessageTime > b.lastMessageTime ? -1 : a.lastMessageTime < b.lastMessageTime ? 1 : 0;
        });
        this._updateActiveFlags(model);
        this._updateUnreadCount(model);
        this._hasChanges = true;
    };
    _observeThreadSelected_commited(model) {
        this._threadsById[model.selectedThreadId].isRead = true;
        this._updateActiveFlags(model);
        this._updateUnreadCount(model);
        this._threadSection.hasChanges = true;
    };
    _updateActiveFlags(model) {
        for (var i = 0; i < this._sortedThreads.length; i++) {
            var thread = this._sortedThreads[i];
            thread.isActive = thread.id === model.selectedThreadId;
        }
    };
    _updateUnreadCount(model) {
        var unreadCount = this._sortedThreads.reduce(function (total, thread) { return thread.isRead ? total : total + 1; }, 0);
        this._unreadCount.value = unreadCount;
        this._unreadCount.isVisible = unreadCount > 0;
    };
}