"use strict";

var entities = require('./entities');
var eventProcessors = require('./eventProcessors');

var ModelBootstrapper = function () {
};

ModelBootstrapper.prototype.start = function () {

    var processors = [
        new eventProcessors.ChatAppEventProcessor(),
        new eventProcessors.ThreadSectionEventProcessor(),
        new eventProcessors.MessageSectionEventProcessor()
    ];

    processors.forEach(function (eventProcesssor) { eventProcesssor.start(); });
};

module.exports = ModelBootstrapper;