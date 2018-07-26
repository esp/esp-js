"use strict";

export default class Thread {
    constructor(id, name, lastMessageTime, lastMessageText) {
        this.id = id;
        this.threadName = name;
        this.lastMessageTime = lastMessageTime;
        this.lastMessageText = lastMessageText;
        this.isActive = false;
        this.isRead = false;
    }
}