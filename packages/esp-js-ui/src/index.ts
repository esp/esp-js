// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

// esp-js-ui — Module loading and bootstrapping for ESP applications
//
// Canonical bootstrap example:
//
// import { EventBus } from 'esp-js';
// import { Container } from 'esp-js-di';
// import { ModuleBuilder, AppBuilder } from 'esp-js-ui';
//
// const ordersModule = ModuleBuilder.create('orders-module')
//     .withContainerConfiguration(container => {
//         container.register('ordersService', OrdersService).singleton();
//     })
//     .withView('orders-store', OrdersView, 'main-region')
//     .withInitialisation(async () => { /* resolve services, load data */ })
//     .withStart(async () => { bus.publishEvent('orders-store', 'AppStarted', {}); })
//     .build();
//
// const app = AppBuilder.create('my-app')
//     .withModule(ordersModule)
//     .withModule(async () => import('./newsModule').then(m => m.newsModule))
//     .withInitialisation(async () => { /* app-level init, runs before modules */ })
//     .withStart(async () => { /* app-level start, runs after modules */ })
//     .build();
//
// const rootContainer = new Container();
// rootContainer.registerInstance('bus', new EventBus());
//
// const modules = await app.loadModules();
// for (const module of modules) {
//     module.configureContainer(rootContainer.createChildContainer());
// }
//
// const initResults = await app.initialise();
// const startResults = await app.start();
//
// // Render views (caller's responsibility using esp-js-react):
// // for (const module of modules) {
// //     for (const binding of module.viewBindings) {
// //         // <ConnectableComponent modelId={binding.storeId} view={binding.viewComponent} />
// //         // placed in the shell slot identified by binding.region
// //     }
// // }
//
// // Cleanup: app.dispose();

export { ModuleBuilder } from './modules/moduleBuilder';
export type { Module, ModuleViewBinding, ModuleLoadResult, ModuleFactory, ModuleOrFactory } from './modules/types';

export { AppBuilder } from './app/appBuilder';
export type { App } from './app/types';
