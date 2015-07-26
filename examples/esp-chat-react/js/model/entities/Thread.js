"use strict";

var Thread = function (id, name, lastMessageTime, lastMessageText) {
    this.id = id;
    this.threadName = name;
    this.lastMessageTime = lastMessageTime;
    this.lastMessageText = lastMessageText;
    this.isActive = false;
    this.isRead = false;
};

module.exports = Thread;