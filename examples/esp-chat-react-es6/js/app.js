import esp from 'esp-js'
import espDevTools from 'esp-js-devtools';
import React from 'react';
import ReactDOM from 'react-dom';

import model from './model';
import components from './components';
import services from './services';

// export for http://fb.me/react-devtools
window.React = React;
espDevTools.registerDevTools();

var router = esp.SingleModelRouter.create();
var messageService = new services.MessageService();
var chatAppModel = new model.ChatApp(messageService, router);
router.setModel(chatAppModel);
chatAppModel.initialise();



ReactDOM.render(
    <components.ChatApp router={router} />,
    document.getElementById('react')
);

router.publishEvent("InitEvent", {});