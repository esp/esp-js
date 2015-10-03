"use strict";

var esp = require('esp-js');
var entities = require('../entities');
var modelRouter = require('../modelRouter');

var ThreadSectionEventProcessor = function () {
    esp.model.DisposableBase.call(this);
};

ThreadSectionEventProcessor.prototype = Object.create(esp.model.DisposableBase.prototype);

ThreadSectionEventProcessor.prototype.start = function () {
    this.observeThreadSelected();
    this.observeMessagesReceived();
};

ThreadSectionEventProcessor.prototype.observeMessagesReceived = function () {
    this.addDisposable(modelRouter
        .getEventObservable("messagesReceived", esp.ObservationStage.commited)
        .observe(function (model, event) {
            for (var i = 0; i < event.rawMessages.length; i++) {
                var rawMessage = event.rawMessages[i];
                var thread = model.threadSection.threadsById[rawMessage.threadId];
                var messageTime = new Date(rawMessage.timestamp);
                if (thread === undefined) {
                    thread = new entities.Thread(
                        rawMessage.threadId,
                        rawMessage.threadName,
                        messageTime,
                        rawMessage.text);
                    model.threadSection.threadsById[rawMessage.threadId] = thread;
                    model.threadSection.sortedThreads.push(thread);
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
            model.threadSection.sortedThreads.sort(function (a, b) {
                return a.lastMessageTime > b.lastMessageTime ? -1 : a.lastMessageTime < b.lastMessageTime ? 1 : 0;
            });
            this._updateActiveFlags(model);
            this._updateUnreadCount(model);
            model.threadSection.hasChanges = true;
        }.bind(this))
        );
};

ThreadSectionEventProcessor.prototype.observeThreadSelected = function () {
    this.addDisposable(modelRouter
        .getEventObservable("threadSelected", esp.ObservationStage.commited)
        .observe(function (model) {
            model.threadSection.threadsById[model.selectedThreadId].isRead = true;
            this._updateActiveFlags(model);
            this._updateUnreadCount(model);
            model.threadSection.hasChanges = true;
        }.bind(this))
        );
};

ThreadSectionEventProcessor.prototype._updateActiveFlags = function (model) {
    for (var i = 0; i < model.threadSection.sortedThreads.length; i++) {
        var thread = model.threadSection.sortedThreads[i];
        thread.isActive = thread.id === model.selectedThreadId;
    }
};

ThreadSectionEventProcessor.prototype._updateUnreadCount = function (model) {
    var unreadCount = model.threadSection.sortedThreads.reduce(function (total, thread) { return thread.isRead ? total : total + 1; }, 0);
    model.threadSection.unreadCount.value = unreadCount;
    model.threadSection.unreadCount.isVisible = unreadCount > 0;
};

module.exports = ThreadSectionEventProcessor;