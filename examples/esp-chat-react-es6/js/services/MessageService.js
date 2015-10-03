/*global localStorage*/
"use strict";

var esp = require("esp-js");
var modelRouter = require('../model/modelRouter');

// !!! Please Note !!!
// We are using localStorage as an example, but in a real-world scenario, this
// would involve XMLHttpRequest, or perhaps a newer client-server protocol.
// The function signatures below might be similar to what you would build, but
// the contents of the functions are just trying to simulate client-server
// communication and server-side processing.

export default class MessageService {
    getMessagesStream() {
        return {
            // poor mans rx api: don't want to pull in rx just to get a nice PUSH API,
            // we'll just model the same observable API here for demo purposes.
            subscribe(observer) {
                // simulate retrieving data from a database
                var rawMessages = JSON.parse(localStorage.getItem("messages"));
                // simulate success callback
                setTimeout(function () {
                    observer({rawMessages: rawMessages});
                }, 0);
            }
        }
    }
}