"use strict";

var esp = require('esp-js');
var entities = require('../entities');
var SendMessageWorkItem = require('./SendMessageWorkItem');
var modelRouter = require('../modelRouter');

var MessageSectionEventProcessor = function () {
    esp.model.DisposableBase.call(this);
    this.messageSubscription = undefined;
};

MessageSectionEventProcessor.prototype = Object.create(esp.model.DisposableBase.prototype);

MessageSectionEventProcessor.prototype.start = function () {
    this.observeThreadSelected();
    this.observeMessagesReceived();
    this.observeMessageSent();
};

MessageSectionEventProcessor.prototype.observeMessagesReceived = function () {
    this.addDisposable(modelRouter
        .getEventObservable("messagesReceived", esp.ObservationStage.commited)
        .observe(function (model) {
            this._updateMessages(model);
            model.messageSection.hasChanges = true;
        }.bind(this))
        );
};

MessageSectionEventProcessor.prototype.observeThreadSelected = function () {
    this.addDisposable(modelRouter
        .getEventObservable("threadSelected", esp.ObservationStage.commited)
        .observe(function (model, event) {
            this._updateMessages(model);
            model.messageSection.threadName = event.threadName;
            model.messageSection.hasChanges = true;
        }.bind(this))
        );
};

MessageSectionEventProcessor.prototype.observeMessageSent = function () {
    this.addDisposable(modelRouter
        .getEventObservable("messageSent")
        .observe(function (model, event) {
            // Todo: cleanup old disposables?
            var sendMessageWorkItem = new SendMessageWorkItem();
            this.addDisposable(sendMessageWorkItem);
            sendMessageWorkItem.send(event.text, model.selectedThreadId, model.messageSection.threadName);
        }.bind(this))
        );
};

MessageSectionEventProcessor.prototype._updateMessages = function (model) {
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

module.exports = MessageSectionEventProcessor;