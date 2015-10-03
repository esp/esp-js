"use strict";

var Message = function (id, authorName, text, time) {
    this.id = id;
    this.authorName = authorName;
    this.time = time;
    this.text = text;
};

module.exports = Message;