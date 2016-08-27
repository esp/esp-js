import esp from 'esp-js'
import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider, SmartComponent} from 'esp-js-react';
import Workspace from './models/workspace';
import WorkspaceView from './views/workspaceView.jsx';

var router = new esp.Router();

var workspace = new Workspace(router);
workspace.observeEvents();

ReactDOM.render(
    <RouterProvider router={router}>
        <SmartComponent modelId={workspace.modelId} view={WorkspaceView} />
    </RouterProvider>,
    document.getElementById('react')
);