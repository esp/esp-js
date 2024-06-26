import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {AppShell} from './shell/appShell';

let appShell = new AppShell();
appShell.start();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(appShell.rootElement);