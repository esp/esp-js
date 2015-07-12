"use strict";

// This file bootstraps the entire application.
var ChatApp = require('./components/ChatApp.react');
var ChatExampleData = require('./ChatExampleData');
var model = require('./model');
var esp = require("esp-js");
var React = require('react');
window.React = React; // export for http://fb.me/react-devtools

var router = new esp.Router();
var modelId = "chatApp";

ChatExampleData.init(); // load example data into localstorage

React.render(
    <ChatApp
        router={router}
        modelId={modelId}
    />,
    document.getElementById('react')
);

var modelBootstrapper = new model.ModelBootstrapper(router, modelId);
modelBootstrapper.start();

router.publishEvent(modelId, "initEvent", {});