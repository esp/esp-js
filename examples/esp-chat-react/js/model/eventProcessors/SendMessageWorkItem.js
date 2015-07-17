/*global localStorage*/

"use strict";

var esp = require("esp-js");
var Rx = require("rx");
var uuid = require('node-uuid');
var modelRouter = require('../modelRouter');

// !!! Please Note !!!
// We are using localStorage as an example, but in a real-world scenario, this
// would involve XMLHttpRequest, or perhaps a newer client-server protocol.
// The function signatures below might be similar to what you would build, but
// the contents of the functions are just trying to simulate client-server
// communication and server-side processing.

var SendMessageWorkItem = function () {
    esp.model.DisposableBase.call(this);
};

SendMessageWorkItem.prototype = Object.create(esp.model.DisposableBase.prototype);

SendMessageWorkItem.prototype.send = function (text, threadId, threadName) {
    // simulate writing to a database
    var rawMessages = JSON.parse(localStorage.getItem("messages"));
    var rawMessage = {
        id: uuid.v4(),
        threadId: threadId,
        threadName: threadName,
        authorName: "Bill", // hard coded for the example
        text: text,
        timestamp: Date.now()
    };
    rawMessages.push(rawMessage);
    localStorage.setItem("messages", JSON.stringify(rawMessages));

    // simulate success callback
    this.addDisposable(
        Rx.Observable
            .timer(0)
            .subscribe(function () {
                modelRouter.publishEvent("messagesReceived", { rawMessages: [ rawMessage ] });
            }.bind(this))
    );
};

module.exports = SendMessageWorkItem;