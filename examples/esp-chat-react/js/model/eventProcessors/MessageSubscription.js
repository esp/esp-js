/*global localStorage*/
"use strict";

var esp = require("esp-js");
var Rx = require("rx");

// !!! Please Note !!!
// We are using localStorage as an example, but in a real-world scenario, this
// would involve XMLHttpRequest, or perhaps a newer client-server protocol.
// The function signatures below might be similar to what you would build, but
// the contents of the functions are just trying to simulate client-server
// communication and server-side processing.

var MessageSubscription = function (router, modelId) {
    esp.model.DisposableBase.call(this);
    this.router = router;
    this.modelId = modelId;
};

MessageSubscription.prototype = Object.create(esp.model.DisposableBase.prototype);

MessageSubscription.prototype.start = function () {
    // simulate retrieving data from a database
    var rawMessages = JSON.parse(localStorage.getItem("messages"));

    // simulate success callback
    this.addDisposable(
        Rx.Observable
            .timer(0)
            .subscribe(function () {
                this.router.publishEvent(this.modelId, "messagesReceived", { rawMessages: rawMessages });
            }.bind(this))
    );
};

module.exports = MessageSubscription;