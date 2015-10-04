import esp from 'esp-js'
import React from 'react';

import ChatExampleData from './ChatExampleData';
import model from './model';
import components from './components';
import services from './services';

// export for http://fb.me/react-devtools
window.React = React;

// load some fake data into localstorage
ChatExampleData.init();

var router = new esp.SingleModelRouter();
var messageService = new services.MessageService();
var model = new model.ChatApp(messageService, router);
router.setModel(model);
model.initialise();

React.render(
    <components.ChatApp router={router} />,
    document.getElementById('react')
);

router.publishEvent("initEvent", {});