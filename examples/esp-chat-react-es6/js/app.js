import esp from 'esp-js'
import React from 'react';

import model from './model';
import components from './components';
import services from './services';

// export for http://fb.me/react-devtools
window.React = React;



var router = new esp.SingleModelRouter();
var messageService = new services.MessageService();
var chatAppModel = new model.ChatApp(messageService, router);
router.setModel(chatAppModel);
chatAppModel.initialise();

React.render(
    <components.ChatApp router={router} />,
    document.getElementById('react')
);

router.publishEvent("InitEvent", {});