"use strict";

var entities = require('./entities');
var eventProcessors = require('./eventProcessors');

var ModelBootstrapper = function (router, modelId) {
    this.router = router;
    this.modelId = modelId;
};

ModelBootstrapper.prototype.start = function () {
    var model = new entities.ChatAppModel();
    this.router.registerModel(this.modelId, model);

    var processors = [
        new eventProcessors.ChatAppEventProcessor(this.router, this.modelId),
        new eventProcessors.ThreadSectionEventProcessor(this.router, this.modelId),
        new eventProcessors.MessageSectionEventProcessor(this.router, this.modelId)
    ];

    processors.forEach(function (eventProcesssor) { eventProcesssor.start(); });
};

module.exports = ModelBootstrapper;