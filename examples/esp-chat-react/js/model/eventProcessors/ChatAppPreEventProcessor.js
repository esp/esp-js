"use strict";

var ChatAppPreEventProcessor = {
    process: function (model) {
        model.messageSection.hasChanges = false;
        model.threadSection.hasChanges = false;
    }
};

module.exports = ChatAppPreEventProcessor;
