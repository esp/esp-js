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

runBasicExample();
