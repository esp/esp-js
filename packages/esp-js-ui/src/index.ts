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
// import { AppBuilder, ModuleBuilder } from 'esp-js-ui';
//
// const ordersModule = ModuleBuilder.create('orders-module')
//     .withContainerConfiguration(container => {
//         // registered in the module's own child container
//         container.register('ordersService', OrdersService).inject('bus').singleton();
//     })
//     .withView('orders-store', OrdersView, 'main-region')
//     .withInitialisation(async ({ moduleContainer, eventBus }) => {
//         const ordersService = moduleContainer.resolve<OrdersService>('ordersService');
//         registerOrdersStore(eventBus, ordersService, 'orders-store');
//     })
//     .withStart(async ({ eventBus }) => { eventBus.publishEvent('orders-store', 'AppStarted', {}); })
//     .build();
//
// const app = AppBuilder.create('my-app')
//     .withModule(ordersModule)
//     .withModule(async () => import('./newsModule').then(m => m.newsModule))
//     .withInitialisation(async app => { /* app-level init, runs before modules */ })
//     .withStart(async app => { /* app-level start, runs after modules */ })
//     .build();
//
// await app.start();
//
// // Render views with esp-js-react: <EspApp app={app}><RegionView regionName="main-region" /></EspApp>
//
// // Cleanup (modules, then the EventBus and its stores, then the root container):
// app.dispose();

export { ModuleBuilder } from './modules/moduleBuilder';
export type { Module, ModuleContext, ModuleHook, ModuleViewBinding, ModuleLoadResult, ModuleFactory, ModuleOrFactory } from './modules/types';

export { AppBuilder } from './app/appBuilder';
export type { App } from './app/types';
