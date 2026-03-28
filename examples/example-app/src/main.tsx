import React from 'react';
import ReactDOM from 'react-dom/client';
import { EspApp } from 'esp-js-react';
import { AppBuilder } from 'esp-js-ui';
import { todoModule } from './modules/todo/todoModule';
import { weatherModule } from './modules/weather/weatherModule';
import { AppShell } from './shell/appShell';

const bootstrap = async () => {
    const app = AppBuilder
        .create('todo-app')
        .withModule(weatherModule)
        .withModule(todoModule)
        .build();

    await app.start();

    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <EspApp app={app}>
                <AppShell />
            </EspApp>
        </React.StrictMode>
    );
};

bootstrap().catch(err => {
    console.error('Fatal bootstrap error:', err);
    document.getElementById('root').innerHTML = `<pre style="color:red;padding:20px">Bootstrap failed:\n${err}</pre>`;
});
