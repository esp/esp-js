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
    class Item {
        constructor(name, otherDependencyA) {
            this.name = name;
            this.otherDependencyA = otherDependencyA;
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
    container.registerInstance('otherDependencyA', "look! a string dependency here");
    container.register('item', Item, ['otherDependencyA']).transient();
    container.register('manager', Manager, [{ type: "autoFactory", key: 'item'}]);
    var manager = container.resolve('manager');
    var fooItem = manager.createItem("Foo");
    console.log("%s-%s", fooItem.name, fooItem.otherDependencyA);
    var barItem = manager.createItem("Bar");
    console.log("%s-%s", barItem.name, barItem.otherDependencyA);
};
runBasicExample();
runLifeTimeTypes();
runInjectionFactories();