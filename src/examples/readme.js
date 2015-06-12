import microdi from '../microdi.js';

var runBasicExample =  () => {
    class Child {
        sayHello() {
            console.log("Hello from the child");
        }
    }
    class Parent {
        constructor(child) {
            this._child = child;
        }
        sayHello() {
            console.log("Hello from the parent");
            this._child.sayHello();
        }
    }
    var container = new microdi.Container();
    container.register('child', Child);
    container.register('parent', Parent, ['child']);
    var parent = container.resolve('parent');
    parent.sayHello();
};

var runLifeTimeTypes = () => {
    var container = new microdi.Container();

    console.log("Singleton");
    var Foo = {};
    container.register('theFoo', Foo).singleton();
    var foo1 = container.resolve('theFoo');
    var foo2 = container.resolve('theFoo');
    console.log(foo1 == foo2); // true

    console.log("Singleton per container");
    var Bar = {};
    container.register('theBar', Bar).singletonPerContainer();
    var bar1 = container.resolve('theBar');
    var bar2 = container.resolve('theBar');
    var childContainer = container.createChildContainer();
    var bar3 = childContainer.resolve('theBar');
    var bar4 = childContainer.resolve('theBar');
    console.log(bar1 == bar2); // true
    console.log(bar2 == bar3); // false
    console.log(bar3 == bar4); // true

    console.log("Transient");
    var Baz = {};
    container.register('theBaz', Foo).transient();
    var baz1 = container.resolve('theBaz');
    var baz2 = container.resolve('theBaz');
    console.log(baz1 == baz2); // false

    console.log("External");
    var Disposable = {
        init() {
            this.isDisposed = false;
            return this;
        },
        dispose() {
            this.isDisposed = true;
        }
    };
    container.registerInstance('disposable1', Object.create(Disposable).init());
    container.register('disposable2', Disposable);
    var disposable1 = container.resolve('disposable1');
    var disposable2 = container.resolve('disposable2');
    container.dispose();
    console.log(disposable1.isDisposed); // false
    console.log(disposable2.isDisposed); // true
};

var runInjectionFactories = () => {
    console.log("injection factories");
    class Item {
        constructor() {
            console.log("creating an item");
        }
    }
    class Manager{
        constructor(itemFactory) {
            this._itemFactory = itemFactory;
        }
        createItem(name) {
            return this._itemFactory(name);
        }
    }
    var container = new microdi.Container();
    container.register('item', Item).transient();
    container.register('manager', Manager, [{ type: "factory", key: 'item'}]);
    var manager = container.resolve('manager');
    var item1 = manager.createItem();
    var item2 = manager.createItem();
};

var runInjectionFactoriesWithOverrides = () => {
    console.log("injection factories with overrides");
    class Item {
        constructor(name) {
            console.log("Hello " + name);
        }
    }
    class Manager{
        constructor(itemFactory) {
            this._itemFactory = itemFactory;
        }
        createItem(name) {
            return this._itemFactory(name);
        }
    }
    var container = new microdi.Container();
    container.register('item', Item).transient();
    container.register('manager', Manager, [{ type: "factory", key: 'item'}]);
    var manager = container.resolve('manager');
    var item1 = manager.createItem("Bob");
    var item2 = manager.createItem("Mick");
};

var runInjectionFactoriesWithOverridesAndDependencies = () => {
    console.log("injection factories with overrides and other dependencies");
    class Item {
        constructor(name, otherDependencyA) {
            console.log("Hello " + name + ". Other dependency: " + otherDependencyA);
        }
    }
    class Manager{
        constructor(itemFactory) {
            this._itemFactory = itemFactory;
        }
        createItem(name) {
            return this._itemFactory(name);
        }
    }
    var container = new microdi.Container();
    container.registerInstance('otherDependencyA', "look! a string dependency");
    container.register('item', Item, ['otherDependencyA']).transient();
    container.register('manager', Manager, [{ type: "factory", key: 'item'}]);
    var manager = container.resolve('manager');
    var fooItem = manager.createItem("Foo");
    var barItem = manager.createItem("Bar");
};

var runGroups = () => {
    console.log("Groups");
    var Foo = {
        name: "theFoo"
    };
    var Bar = {
        name: "theBar"
    };
    var container = new microdi.Container();
    container.register('foo', Foo).inGroup("group1");
    container.register('bar', Bar).inGroup("group1");
    var group1 = container.resolveGroup("group1");
    for (let i = 0, len = group1.length; i < len; i++) {
        console.log(group1[i].name);
    }
};

var runChildContainer = () => {
    console.log("Child containers");
    var Foo = { };
    var container = new microdi.Container();
    var childcontainer = container.createChildContainer();
    container.register('foo', Foo); // defaults to singleton registration
    var foo1 = container.resolve('foo');
    var foo2 = childcontainer.resolve('foo');
    console.log(foo1 == foo2); // true, same instance

    container.register('fooAgain', Foo).singletonPerContainer();
    var foo3 = container.resolve('fooAgain');
    var foo4 = childcontainer.resolve('fooAgain');
    console.log(foo3 == foo4); // false, different instance
    var foo5 = childcontainer.resolve('fooAgain');
    console.log(foo4 == foo5); // true, same instance
};

var runChildContainerRegistrations = () => {
    console.log("Child container registrations");
    var Foo = { };
    var container = new microdi.Container();
    container.register('foo', Foo); // defaults to singleton registration

    var childcontainer = container.createChildContainer();
    childcontainer.register('foo', Foo).transient();

    var foo1 = container.resolve('foo');
    var foo2 = container.resolve('foo');
    console.log(foo1 == foo2); // true, same instance

    var foo3 = childcontainer.resolve('foo');
    console.log(foo2 == foo3); // false, different instance

    var foo4 = childcontainer.resolve('foo');
    console.log(foo3 == foo4); // false, different instance
};

var runDisposal = () => {
    console.log("Container disposal");

    class Foo {
        dispose() {
            console.log("foo disposed");
        }
    }

    var container = new microdi.Container();

    container.register('foo', Foo).singletonPerContainer();
    var foo1 = container.resolve('foo');

    var childcontainer = container.createChildContainer();
    var foo2 = childcontainer.resolve('foo');

    container.dispose();
};

var runCustomDependencyResolver = () => {
    console.log("Custom dependency resolver");
    class DomResolver {
        resolve(container, resolverKey) {
            // return a pretend dom elemenet,
            return {
                get description() {
                    return "Fake DOM element - " + resolverKey.domId ;
                }
            };
        }
    }
    var container = new microdi.Container();
    container.addResolver("domResolver", new DomResolver());
    // Note the usage of 'isResolverKey' so the container can distingush this from a normal object.
    // This is only required when you don't register a constructor function or prototype.
    container.register('view', { type: "domResolver", domId : "theDomId", isResolerKey: true });
    var view = container.resolve('view');
    console.log(view.description);
};


var runCustomDependencyResolver2 = () => {
    console.log("Custom dependency resolver 2");
    class DomResolver {
        resolve(container, resolverKey) {
            // return a pretend dom elemenet,
            return {
                get description() {
                    return "Fake DOM element - " + resolverKey.domId ;
                }
            };
        }
    }
    var container = new microdi.Container();
    container.addResolver("domResolver", new DomResolver());
    class Controller {
        constructor(view) {
            console.log(view.description);
        }
    }
    // Note we don't need to specift the 'isResolerKey' property on the resolverkey.
    // The container assumes it is as it appears in the dependency list.
    container.register('controller', Controller, [{ type: "domResolver", domId : "viewId" }]);
    var controller = container.resolve('controller');
};

var runDelegeateResolver = () => {
    console.log("Delegate resolver");
    class Foo  {
        constructor(bar) {
            console.log("bar is : [%s]", bar);
        }
    }
    var container = new microdi.Container();
    container.register(
        'foo',
        Foo,
        [{
            type: "delegate",
            resolve: (container, resolveKey) => {
                return "barInstance";
            }
        }]
    );
    var foo = container.resolve('foo');
};

runBasicExample();
runLifeTimeTypes();
runInjectionFactories();
runInjectionFactoriesWithOverrides();
runInjectionFactoriesWithOverridesAndDependencies();
runGroups();
runChildContainer();
runChildContainerRegistrations();
runDisposal();
runCustomDependencyResolver();
runCustomDependencyResolver2();
runDelegeateResolver();