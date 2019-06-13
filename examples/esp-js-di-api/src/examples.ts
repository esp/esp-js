/* notice_start
 * Copyright 2016 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 notice_end */
 
import { Container } from 'esp-js-di';

export const runBasicExample =  () => {
    class Child {
        sayHello() {
            console.log('Hello from the child');
        }
    }
    class Parent {
        constructor(private _child) {
        }
        sayHello() {
            console.log('Hello from the parent');
            this._child.sayHello();
        }
    }
    let container = new Container();
    container.register('child', Child);
    container.register('parent', Parent).inject('child');
    let parent = container.resolve<Parent>('parent');
    parent.sayHello();
};

export const runLifeTimeTypes = () => {
    let container = new Container();

    console.log('Singleton');
    let Foo = {};
    container.register('theFoo', Foo).singleton();
    let foo1 = container.resolve('theFoo');
    let foo2 = container.resolve('theFoo');
    console.log(foo1 === foo2); // true

    console.log('Singleton per container');
    let Bar = {};
    container.register('theBar', Bar).singletonPerContainer();
    let bar1 = container.resolve('theBar');
    let bar2 = container.resolve('theBar');
    let childContainer = container.createChildContainer();
    let bar3 = childContainer.resolve('theBar');
    let bar4 = childContainer.resolve('theBar');
    console.log(bar1 === bar2); // true
    console.log(bar2 === bar3); // false
    console.log(bar3 === bar4); // true

    console.log('Transient');
    let Baz = {};
    container.register('theBaz', Foo).transient();
    let baz1 = container.resolve('theBaz');
    let baz2 = container.resolve('theBaz');
    console.log(baz1 === baz2); // false

    console.log('External');
    interface SupportsDisposable  {
        dispose();
        isDisposed: boolean;
    }
    let Disposable = {
        init() {
            this.isDisposed = false;
            return this;
        },
        dispose() {
            this.isDisposed = true;
        }
    };
    // Note registerInstance internally sets the lifetime type as 'external',
    // You can pass false as the last argument if you want to change this.
    // The container will then manage it as 'singleton' and dispose the instance at disposal time
    container.registerInstance('disposable1', Object.create(Disposable).init());
    container.register('disposable2', Disposable);
    let disposable1 = container.resolve<SupportsDisposable>('disposable1');
    let disposable2 = container.resolve<SupportsDisposable>('disposable2');
    container.dispose();
    console.log(disposable1.isDisposed); // false
    console.log(disposable2.isDisposed); // true
};

export const runGroups = () => {
    console.log('Groups');
    let Foo = {
        name: 'theFoo'
    };
    let Bar = {
        name: 'theBar'
    };
    let container = new Container();
    container.register('foo', Foo).inGroup('group1');
    container.register('bar', Bar).inGroup('group1');
    let group1 = container.resolveGroup<{name: string}>('group1');
    for (let i = 0, len = group1.length; i < len; i++) {
        console.log(group1[i].name);
    }
};

export const runResolutionWithAdditionalDependencies = () => {
    console.log('Resolution with additional dependencies');
    class Foo {
        constructor(fizz, bar, bazz) {
            console.log('%s %s %s', fizz.name, bar.name, bazz.name);
        }
    }
    let container = new Container();
    container.register('fizz', { name: 'fizz'});
    container.register('foo', Foo).inject('fizz');
    let foo = container.resolve('foo', { name: 'bar'}, { name: 'bazz'});
};

export const runInjectionFactories = () => {
    console.log('injection factories');
    class Item {
        constructor() {
            console.log('creating an item');
        }
    }
    class Manager {
        constructor(private _itemFactory: () => Item) {
        }
        createItem() {
            return this._itemFactory();
        }
    }
    let container = new Container();
    container.register('item', Item).transient();
    container.register('manager', Manager).inject({ resolver: 'factory', key: 'item'});
    let manager = container.resolve<Manager>('manager');
    let item1 = manager.createItem();
    let item2 = manager.createItem();
};

export const runInjectionFactoriesWithAdditionalDependencies = () => {
    console.log('injection factories with additional dependencies');
    class Item {
        constructor(otherDependencyA, name) {
            console.log('Hello ' + name + '. Other dependency: ' + otherDependencyA);
        }
    }
    class Manager {
        constructor(private _itemFactory: (name) => Item) {
        }
        createItem(name) {
            return this._itemFactory(name);
        }
    }
    let container = new Container();
    container.registerInstance('otherDependencyA', 'look! a string dependency');
    container.register('item', Item).inject('otherDependencyA').transient();
    container.register('manager', Manager).inject({ resolver: 'factory', key: 'item'});
    let manager = container.resolve<Manager>('manager');
    let fooItem = manager.createItem('Foo');
    let barItem = manager.createItem('Bar');
};

export const runChildContainer = () => {
    console.log('Child containers');
    let Foo = { };
    let container = new Container();
    let childContainer = container.createChildContainer();
    container.register('foo', Foo); // defaults to singleton registration
    let foo1 = container.resolve('foo');
    let foo2 = childContainer.resolve('foo');
    console.log(foo1 === foo2); // true, same instance

    container.register('fooAgain', Foo).singletonPerContainer();
    let foo3 = container.resolve('fooAgain');
    let foo4 = childContainer.resolve('fooAgain');
    console.log(foo3 === foo4); // false, different instance
    let foo5 = childContainer.resolve('fooAgain');
    console.log(foo4 === foo5); // true, same instance
};

export const runChildContainerRegistrations = () => {
    console.log('Child container registrations');
    let Foo = { };
    let container = new Container();
    container.register('foo', Foo); // defaults to singleton registration

    let childcontainer = container.createChildContainer();
    childcontainer.register('foo', Foo).transient();

    let foo1 = container.resolve('foo');
    let foo2 = container.resolve('foo');
    console.log(foo1 === foo2); // true, same instance

    let foo3 = childcontainer.resolve('foo');
    console.log(foo2 === foo3); // false, different instance

    let foo4 = childcontainer.resolve('foo');
    console.log(foo3 === foo4); // false, different instance
};

export const runDisposal = () => {
    console.log('Container disposal');

    class Foo {
        dispose() {
            console.log('foo disposed');
        }
    }

    let container = new Container();

    container.register('foo', Foo).singletonPerContainer();
    let foo1 = container.resolve('foo');

    let childcontainer = container.createChildContainer();
    let foo2 = childcontainer.resolve('foo');

    container.dispose();
};

export const runCustomDependencyResolver = () => {
    console.log('Custom dependency resolver');
    class DomResolver {
        resolve(container1, resolverKey) {
            // return a pretend dom element,
            return {
                get description() {
                    return 'Fake DOM element - ' + resolverKey.domId ;
                }
            };
        }
    }
    let container = new Container();
    container.addResolver('domResolver', new DomResolver());
    // Note the usage of 'isResolverKey' so the container can distinguish this from a normal object.
    // This is only required when you don't register a constructor function or prototype.
    container.register('view', { resolver: 'domResolver', domId : 'theDomId', isResolverKey: true });
    let view = container.resolve<{ description: string }>('view');
    console.log(view.description);
};

export const runCustomDependencyResolver2 = () => {
    console.log('Custom dependency resolver 2');
    class DomResolver {
        resolve(container1, resolverKey) {
            // return a pretend dom elemenet,
            return {
                get description() {
                    return 'Fake DOM element - ' + resolverKey.domId ;
                }
            };
        }
    }
    let container = new Container();
    container.addResolver('domResolver', new DomResolver());
    class Controller {
        constructor(view) {
            console.log(view.description);
        }
    }
    // Note we don't need to specify the 'isResolverKey' property on the resolverKey.
    // The container assumes it is as it appears in the dependency list.
    container.register('controller', Controller).inject({ resolver: 'domResolver', domId : 'viewId' });
    let controller = container.resolve('controller');
};

export const runDelegeateResolver = () => {
    console.log('Delegate resolver');
    class Foo  {
        constructor(bar) {
            console.log('bar is : [%s]', bar);
        }
    }
    let container = new Container();
    container.register('foo', Foo)
        .inject(
        {
            resolver: 'delegate',
            resolve: (container1, resolveKey) => {
                return 'barInstance';
            }
        });
    let foo = container.resolve('foo');
};