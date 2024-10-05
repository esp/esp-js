import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {AppShell} from './shell/appShell';
import './css/espdemo.css';

let appShell = new AppShell();
appShell.start();
ReactDOM.render(
    appShell.rootElement,
    document.getElementById('root')
);