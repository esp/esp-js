"use strict";

var esp = require('esp-js');
var MessageSubscription = require('./MessageSubscription');

var ChatAppEventProcessor = function (router, modelId) {
    esp.model.DisposableBase.call(this);
    this.router = router;
    this.modelId = modelId;
    this.messageSubscription = null;
};

ChatAppEventProcessor.prototype = Object.create(esp.model.DisposableBase.prototype);

ChatAppEventProcessor.prototype.start = function () {
    this.messageSubscription = new MessageSubscription(this.router, this.modelId);
    this.addDisposable(this.messageSubscription);
    this.observeInitEvent();
    this.observeThreadSelected();
    this.observeMessagesReceived();
};

ChatAppEventProcessor.prototype.observeInitEvent = function () {
    this.addDisposable(this.router
        .getEventObservable(this.modelId, "initEvent")
        .observe(function () {
            this.messageSubscription.start();
        }.bind(this))
        );
};

ChatAppEventProcessor.prototype.observeMessagesReceived = function () {
    this.addDisposable(this.router
        .getEventObservable(this.modelId, "messagesReceived")
        .observe(function (model, event, eventContext) {
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
        })
        );
};

ChatAppEventProcessor.prototype.observeThreadSelected = function () {
    this.addDisposable(this.router
        .getEventObservable(this.modelId, "threadSelected")
        .observe(function (model, event, eventContext) {
            model.selectedThreadId = event.threadId;
            eventContext.commit();
        })
        );
};

module.exports = ChatAppEventProcessor;