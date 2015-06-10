# Microdi-js
Microdi-js is a tiny but feature rich dependency injection container for JavaScript.

# Basic usage
You can register an object using one of two methods:

* `container.register(identifier:string, object:object/ctor-function [, dependencyList:[]])`.
  Registers either a constructor function or object prototype using the given identifier. Optionally provide a [dependencyList](#the-dependency-list).
* `container.registerInstance(identifier:string, objectInstance:object)`.
  Registers the given object instance using the given identifier.

Object resolution is done via :

* `container.resolve(identifier:string);`
  This simple builds the object registered with the given `identifier`;
 
## Example
Below we have 2 simple classes. 
`Parent` takes `Child` as it's dependency. 
`Child` is registered with the identifier 'child' and `Parent` with the identifier 'parent'.
Additionally the parent registration denotes via it's [dependency list](#the-dependency-list) that it takes the `Child` as a dependency. 

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
```

Output: 
```
keith@devshop:~/Dev/personal/microdi-js/dist/examples$ node readme.js 
Hello from the parent
Hello from the child
```

# Concepts

## Identifiers 
JavaScript doesn't have a type system which makes containers a little cumbersome to use. 
Typically in typed languages you'd utilise information provided by type system to aid in dependency resolution and injection.
However without such a system all is not lost, we can simply use strings (i.e. 'identifiers') to id objects to construct.

## The Dependency List
The dependency list is an array of dependencies required to build the instance being registered.
Each item in the dependency list represents a dependency to be injected into the instance that will be build.
The order of the items in the list matches the order of the items listed in the items constructor (be it a objects or ctor function). 
The list can contain both [identifiers](#identifiers) of other registrations and/or [dependency resolvers](#dependency-resolvers).
Identifiers of other registrations simply means, resolve the other dependency by it's identifier and inject that . 
A [dependency resolver](#dependency-resolvers) adds functionality to how the container will acquire and build the dependency that is to be injected.

# Features

## Object creation & dependency injection
A call to `resolve` will trigger build up of the object in question. Any dependencies the object requires will be injected.

### Function constructors
If the type registered is a function constructor it will be 'new-ed' up accordingly and any dependencies passed in.

### Prototypical inheritance
If the type registered is an object then a new object will be created using Object.create(registeredObject).
If the object has an `init` method then this will be called passing the dependencies.

## Lifetime management
An objects lifetime can be controlled by the container in a number of ways.

### Singleton
If a registration is singleton this means the container will hold onto the object instance.
When the container is disposed, and if the instance has a `dispose` method, this method will be called.


```javascript
    var Foo = {};
    container.register('theFoo', Foo).singleton();
    var foo1 = container.resolve('theFoo');
    var foo2 = container.resolve('theFoo');
    console.log(foo1 == foo2); // true
```
Note this is the default lifetime used and so the call to `.singelton()` is optional.

### Singleton Per Container
Similar to a singleton however you get a single instance per child container.

```javascript
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
```

### Transient
This creates a new instance each time

```javascript
    var Baz = {};
    container.register('theBaz', Foo).transient();
    var baz1 = container.resolve('theBaz');
    var baz2 = container.resolve('theBaz');
    console.log(baz1 == baz2); // false
```

### External
Like a singleton however the container won't dispose the object when it's disposed.

```javascript
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
```

## Injection factories
Sometimes you want your object to receive a factory that can create other objects.

```javascript
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
```
output:
```
Foo-look! a string dependency here
Bar-look! a string dependency here
```
## Child containers

### Overriding Registrations

### Lifetime management in child containers

### Disposal

## Dependency Resolvers

### Built in resolvers
#### Factory
#### Auto Factory

### Add your own resolvers


