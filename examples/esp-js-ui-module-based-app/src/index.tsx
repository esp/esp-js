import {ShellBootstrapper} from './shell/shellBootstrapper';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

let shellBootstrapper = new ShellBootstrapper();
ReactDOM.render(
    shellBootstrapper.rootElement,
    document.getElementById('root')
);