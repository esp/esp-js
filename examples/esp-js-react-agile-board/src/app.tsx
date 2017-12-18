import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RouterProvider, SmartComponent} from 'esp-js-react';
import { Workspace } from './models/workspace';
import { Modal } from './models/modal';
import { Router } from 'esp-js';

// create an app wide router
let router = new Router();

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
    document.getElementById('root')
);