/*global localStorage*/
"use strict";

var esp = require("esp-js");
var modelRouter = require('../modelRouter');

// !!! Please Note !!!
// We are using localStorage as an example, but in a real-world scenario, this
// would involve XMLHttpRequest, or perhaps a newer client-server protocol.
// The function signatures below might be similar to what you would build, but
// the contents of the functions are just trying to simulate client-server
// communication and server-side processing.

var MessageSubscription = function () {
    esp.model.DisposableBase.call(this);
};

MessageSubscription.prototype = Object.create(esp.model.DisposableBase.prototype);

MessageSubscription.prototype.start = function () {
    // simulate retrieving data from a database
    var rawMessages = JSON.parse(localStorage.getItem("messages"));

    // simulate success callback
    setTimeout(function () {
        modelRouter.publishEvent("messagesReceived", {rawMessages: rawMessages});
    }, 0);
};

module.exports = MessageSubscription;