import esp from 'esp-js'
import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider, SmartComponent} from 'esp-js-react';
import Workspace from './models/workspace';
import Modal from './models/modal';

// create an app wide router
let router = new esp.Router();

// create a model responsible for displaying app wide modal windows
let modal = new Modal(router);
modal.observeEvents();

// create the main model
let workspace = new Workspace(router, modal);
workspace.observeEvents();

ReactDOM.render(
    <RouterProvider router={router}>
        <div>
            <SmartComponent modelId={workspace.modelId} />
            <SmartComponent modelId={modal.modelId} />
        </div>
    </RouterProvider>,
    document.getElementById('react')
);