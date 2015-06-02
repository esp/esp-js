# Microdi-js
Microdi-js is a tiny dependency injection container for JavaScript.

 
# How it works
JavaScript doesn't have a type system which makes containers a little cumbersome to use. 
Typically in typed languages you'd utilise information provided by type system to aid in dependency resolution and injection.
However without such a system all is not lost, we can simply use string keys to identify objects to construct, albeit more tediously.

``` javascript
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
var container = new Container();
container.register('child', Child);
container.register('parent', Parent, ['child']);
var parent = container.resolve('parent');
parent.sayHello();
````
