# Microdi-js

Microdi-js is a tiny but feature rich dependency injection container for JavaScript.

# Basic usage

You can register an object using one of two methods:

* `container.register(identifier:string, object:object/ctor-function [, dependencyList:[]])`.
  Registers either a constructor function or object prototype using the given identifier. Optionally provide a [dependencyList](#the-dependency-list).
* `container.registerInstance(identifier:string, objectInstance:object)`.
  Registers the given object instance using the given identifier.

Object resolution is done via :

* `container.resolve(identifier:string [, ...dependencyOverrides]);`
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

### Singleton per container

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
container.register('manager', Manager, [{ type: "autoFactory", key: 'item'}]);
var manager = container.resolve('manager');
var item1 = manager.createItem();
var item2 = manager.createItem();
```

output:

```
injection factories
creating an item
creating an item

```

### Parameter overrides

You can pass arguments to the factory and they will be passed in order to the item being constructed.
If we change `Item` in the above sample to be:

```javascript
class Item {
    constructor(name) {
        console.log("Hello " + name);
    }
}
```

And call it like this:

```javascript
var item1 = manager.createItem("Bob");
var item2 = manager.createItem("Mick");
```

we get this output:

```
Hello Bob
Hello Mick
```

### Parameter overrides with other dependencies
If the object that your auto factory will create takes dependencies, these dependencies will be prepended to the paramaters you pass.

The above sample modified to demonstrate this:

```javascript
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
container.register('manager', Manager, [{ type: "autoFactory", key: 'item'}]);
var manager = container.resolve('manager');
var fooItem = manager.createItem("Foo");
var barItem = manager.createItem("Bar");
```

Output:

```
Hello Foo. Other dependency: look! a string dependency
Hello Bar. Other dependency: look! a string dependency
```

## Resolve groups


## Child containers

Child containers can be used to manage a set of related dependencies.

Create a child container by calling `createChildContainer` on a parent;
```javascript
var container = new microdi.Container();
var childcontainer = container.createChildContainer();
```

### Lifetime management in child containers

Depending upon object configurations, objects resoled from a child containser will either be owned by the child container or taken from the parent.

```javascript
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
```

### Overriding Registrations

The configuration of a child container can be overriden if required.

```javascript
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
```

Output:

```
true
false
false
```

### Disposal

When you call `.disopse()` on a child container, it will call a `dispose` method on any object it holds reference to.
It will not dispose trasientely registered objects created or objects registered via `registerInstance('aKey', myInstance)`.
Any child containers and objcts they own will also be disposed.

```javascript
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
```

Output:

```
foo disposed
foo disposed
```

## Dependency Resolvers

Dependency resolvers alter the default way a dependecy is created.
A resolver is simplly an object with a `resolve(container, resolverKey)` method.
You can create your own resolvers and add them to the container.
When registering an object, a `resolverKey` can be used to refer to a dependency resolver to perform the resoultion.
A `resolverKey` can appear as the object to build or in the dependency list.
The container will call the dependency reolver to create the object in question passing itself and the resolverKey.

```javascript
container.register('foo', resolverKey);
// or
container.register('foo', Foo, [resolverKey]);
```

Here is an example where rather than registering a concrete object to build, a `resolverKey` is used.
The `DomResolver` resolver will be used to build the object.

```javascript
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
container.register('controller', { type: "domResolver", domid : "theDomId", isResolerKey: true });
var controller = container.resolve('controller');
console.log(controller.description);
```

Output:

```
Fake DOM element - theDomId
```

Here is an example where a concrete object is registered and a resolverKey is used to resolve a dependency of the registered item.

```javascript
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
    constructor(domElement) {
        console.log(domElement.description);
    }
}
// Note we don't need to specift the 'isResolerKey' property on the resolverkey.
// The container assumes it is as it appears in the dependency list.
container.register('controller', Controller, [{ type: "domResolver", domid : "theDomId" }]);
var controller = container.resolve('controller');
```

Output:

```
Fake DOM element - theDomId
```

### Built in resolvers
There are 2 built in resolvers.

#### Deletate

This simply defers object creation to a delegate provided by the resolverKey.

```javascript
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
        resolve: (container) => {
            // create the required instance
            return "barInstance";
        }
    }]
);
var foo = container.resolve('foo');
```

Output:

```
bar is : [barInstance]
```

#### Injection factory

Discussed [above](injection-factories) this resolver injects a factory that can be called mutiple times to create the dependency.

