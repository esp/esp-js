"use strict";

var ChatAppModel = function () {
    this.rawMessagesByThreadId = {};
    this.selectedThreadId = null;
    this.threadSection = {
        threadsById: {},
        sortedThreads: [],
        unreadCount: {
            value: 0,
            isVisible: false
        }
    };
    this.messageSection = {
        sortedMessages: [],
        threadName: null
    };
};

module.exports = ChatAppModel;