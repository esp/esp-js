import * as esp from 'esp-js'
import * as espDevTools from 'esp-js-devtools';
import React from 'react';
import ReactDOM from 'react-dom';

import * as model from './model';
import * as services from './services';
import {ChatApp} from './components/chatApp';

// export for http://fb.me/react-devtools
window.React = React;
espDevTools.registerDevTools();

var router = esp.SingleModelRouter.create();
var messageService = new services.MessageService();
var chatAppModel = new model.ChatApp(messageService, router);
router.setModel(chatAppModel);
chatAppModel.initialise();



ReactDOM.render(
    <ChatApp router={router} />,
    document.getElementById('react')
);

router.publishEvent("InitEvent", {});