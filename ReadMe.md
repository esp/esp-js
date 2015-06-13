[![Build Status](https://travis-ci.org/sonic78/microdi-js.svg?branch=master)](https://travis-ci.org/sonic78/microdi-js)

# Microdi-js

Microdi-js is a tiny but feature rich dependency injection container for JavaScript.

# Basic usage

You can register an object using one of two methods:

* `container.register(identifier, Item)`.

  This registers either a constructor function OR an object prototype `Item` using the given string `identifier`.

  You can chain calls to alter the registration settings:
  
  ```javascript
  var identifier = 'itemKey1';
  container
    .register('identifier', Item)
    .inject('otherDependencyIdentifier1', 'otherDependencyIdentifier1')
    .singletonPerContainer()
    .inGroup('mySimilarObjects');
  ```

  Here we register `Item` using the string `identifier`. 
  We state that it requires [dependencies](#dependencies) `otherDependencyIdentifier1` and `otherDependencyIdentifier1`. 
  It's [lifetime management](#lifetime-management) is `singletonPerContainer`.
  It can be resolved using the `identifier` or as part of the [group](#resolve-groups) `mySimilarObjects`. 
  
* `container.registerInstance(identifier, objectInstance)`.

  Registers the given `objectInstance` using the string `identifier`.

Object resolution is done via :

* `container.resolve(identifier [, additionalDependency1, additionalDependency2, etc. ]);`

  This simply builds the object registered with the given `identifier`. 
  Any dependencies will also be built and injected.
  Optionally provide additional dependencies which will get passed in after any that were specified via `inject()` at registration time.
  
* `container.resolveGroup(name);`

   Resolving a [group](#resolve-groups) returns an array of objects registered against that group. 
 
## Example

Below we have 2 simple classes. 
`Parent` takes `Child` as it's dependency. 
`Child` is registered with the identifier 'child' and `Parent` with the identifier 'parent'.
Additionally the parent registration injects the `Child` as a [dependency](#dependencies).

``` javascript
class Child {
    sayHello() {
        console.log('Hello from the child');
    }
}
class Parent {
    constructor(child) {
        this._child = child;
    }
    sayHello() {
        console.log('Hello from the parent');
        this._child.sayHello();
    }
}
var container = new microdi.Container();
container.register('child', Child);
container.register('parent', Parent).inject('child');
var parent = container.resolve('parent');
parent.sayHello();
```

Output:

```
keith@devshop:~/dev/personal/microdi-js/dist/examples$ node readme.js
Hello from the parent
Hello from the child
```

# Concepts

## Identifiers

JavaScript doesn't have a type system which makes containers a little cumbersome to use. 
Typically in typed languages you'd utilise information provided by the type system to aid in dependency resolution and injection.
However without such a system all is not lost, we can simply use strings (i.e. 'identifiers') to identify objects to construct.

## Dependencies
We need to manually specify objects dependencies at registration time. 
This is because there are no means available to inspect arguments required for `constructors` or `init` methods at object instantiation/initialisation time.
We specify dependencies via `inject`:

```javascript
container.register('a', A)
         .inject(dependency1, dependency2, etc.);`
```

Each item passed to `inject` represents a dependency to be injected into the instance that will be build.
During `resolve` dependencies will be passed to the new instance in the same order they were provided to `inject`.
The arguments to `inject` can contain string `identifiers` referencing other registrations and/or `resolverKey`s.
A `resolverKey` references a [dependency resolver](#dependency-resolvers) which adds functionality to how the container will acquire and build the dependency.

Lets look at an example:

```javascript
class Controller { 
    constructor(a, factoryThatMakesB) {}
}
container.register('a', A);
container.register('b', B);
container
    .register('controller', Controller)
    .inject('a', { resolver: 'factory', key : 'b' });
```

The above registers a `Controller` using the identifier `controller`.
It specifies `Controller` requires 2 dependencies:

* The dependency registered as `a`.
* The dependency `{ resolver: 'factory', key : 'b' }`, this is a `resolverKey` telling the container to build the dependency `b` using the build in [injection factory](#injection-factories) resolver.

# Features

## Object creation & dependency injection

A call to `resolve` will trigger build up of the object in question. 
Any [dependencies](#dependencies) the object requires will be resolved and injected.

### Function constructors

If the type registered is a constructor function (i.e. typeof registeredObject === 'function') it will be initialised accordingly and any [dependencies](#dependencies) passed in.

### Prototypical inheritance

If the type registered is not a constructor function it will be assumed a prototype.
At resolve time new object/s will be created using Object.create(registeredObject).
If the object has an `init` method then this will be called passing any [dependencies](#dependencies).

## Lifetime management

An object’s lifetime can be controlled by the container in a number of ways.

### Singleton

A singleton registration specifies the container will hold onto the object instance.
Multiple calls to `resolve` with the same key will yield the same instance.
When the container is disposed, the container will, for any registered instances with a `dispose` function, invoke that function.


```javascript
var Foo = {};
container.register('theFoo', Foo).singleton();
var foo1 = container.resolve('theFoo');
var foo2 = container.resolve('theFoo');
console.log(foo1 == foo2); // true
```

Note this is the default lifetime used and so the call to `.singleton()` is optional.

### Singleton per container

This is similar to a singleton however you get a single instance per child container.

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

This creates a new instance each time a call to `resolve(identifier)` or `resolveGroup(groupName)` is made.
The container will not hold a reference to the instances created.

```javascript
var Baz = {};
container.register('theBaz', Baz).transient();
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
// Note registerInstance internally sets the lifetime type as 'external', 
// You can pass false as the last argument if you want to change this. 
// The container will then manage it as 'singleton' and dispose the instance at disposal time 
container.registerInstance('disposable1', Object.create(Disposable).init());
container.register('disposable2', Disposable);
var disposable1 = container.resolve('disposable1');
var disposable2 = container.resolve('disposable2');
container.dispose();
console.log(disposable1.isDisposed); // false
console.log(disposable2.isDisposed); // true
```

## Resolve groups

You can group objects together at registration time then resolve them using `resolveGroup(name)`.
Typically this is handy when you're objects share a related abstraction.

```javascript
var Foo = {
    name: "theFoo"
};
var Bar = {
    name: "theBar"
};
var container = new microdi.Container();
container.register('foo', Foo).inGroup('group1');
container.register('bar', Bar).inGroup('group1');
var group1 = container.resolveGroup('group1');
for (let i = 0, len = group1.length; i < len; i++) {
    console.log(group1[i].name);
}
```

Output:

```
theFoo
theBar
```

## Resolution with additional dependencies

When calling `resolve` you can optionally pass additional [dependencies](#dependencies).
These will be appended to the dependencies provided to `inject` at registration time (if any).

```javascript
class Foo {
    constructor(fizz, bar, bazz) {
        console.log('%s %s %s', fizz.name, bar.name, bazz.name);
    }
}
var container = new microdi.Container();
container.register('fizz', { name: 'fizz'});
container.register('foo', Foo).inject('fizz');
var foo = container.resolve('foo', { name: 'bar'}, { name: 'bazz'});
```

Output

```
fizz bar bazz
```

## Injection factories

Sometimes you want your object to receive a factory, that when called will `resolve` and return the dependency in question.

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
container.register('manager', Manager).inject({ resolver: 'factory', key: 'item'});
var manager = container.resolve('manager');
var item1 = manager.createItem();
var item2 = manager.createItem();
```

output:

```
creating an item
creating an item

```

### Additional dependencies

You can pass arguments to the factory and they forwarded as discussed [above](#resolution-with-additional-dependencies).

Lets modify the sample from above to demonstrate this:

```javascript
class Item {
    constructor(otherDependencyA, name) {
        console.log('Hello ' + name + '. Other dependency: ' + otherDependencyA);
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
container.registerInstance('otherDependencyA', 'look! a string dependency');
container.register('item', Item).inject('otherDependencyA').transient();
container.register('manager', Manager).inject({ resolver: 'factory', key: 'item'});
var manager = container.resolve('manager');
var fooItem = manager.createItem('Foo');
var barItem = manager.createItem('Bar');
```

output:

```
Hello Bob
Hello Mick
```

## Child containers

Child containers can be used to manage and scope a set of related objects.

Create a child container by calling `createChildContainer` on a parent;
```javascript
var container = new microdi.Container();
var childcontainer = container.createChildContainer();
```

### Lifetime management in child containers

Depending upon registration configurations, objects resolved from a child container will either be owned by the child container or the parent.

```javascript
var Foo = { };
var container = new microdi.Container();
var childContainer = container.createChildContainer();
container.register('foo', Foo); // defaults to singleton registration
var foo1 = container.resolve('foo');
var foo2 = childContainer.resolve('foo');
console.log(foo1 == foo2); // true, same instance

container.register('fooAgain', Foo).singletonPerContainer();
var foo3 = container.resolve('fooAgain');
var foo4 = childContainer.resolve('fooAgain');
console.log(foo3 == foo4); // false, different instance
var foo5 = childContainer.resolve('fooAgain');
console.log(foo4 == foo5); // true, same instance
```

### Overriding Registrations

The configuration of a child container can be overridden if required.

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

When you call `.dispose()` on a child container, that container will inspect any object it holds and if an object has a `dispose` function, it will be called.
However it will not dispose transient-created objects or objects registered via `registerInstance('aKey', myInstance)`.
Any child containers created from the disposed parent will also be disposed.  These child containers will in turn dispose of their registered instances.

```javascript
class Foo {
    dispose() {
        console.log('foo disposed');
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

Dependency resolvers alters the default way a dependency is created.
A dependency resolver is simply an object with a `resolve(container, resolverKey)` method.
You can create your own resolvers and add them to the container.
When registering an object, a `resolverKey` can be used as a [dependency](#dependencies).
This enables the container to resolve the dependency using the resolver specified.
A `resolverKey` can can also be specified as a replacement for the object or construction function that is to be built.
At resolve time the container will call the dependency resolver specified by the `resolverKey` to create the object in question.
The `container` and the `resolverKey` specified via `inject()` will be passed to the resolvers `resolve` method.
This sounds a bit more complicated than it actually is, it's easier to demonstrate with some code.

Here is an example where rather than registering a concrete object to build, a `resolverKey` is used.
The `DomResolver` resolver will be used to resolve the object.

```javascript
class DomResolver {
    resolve(container, resolverKey) {
        // return a pretend dom element,
        return {
            get description() {
                return 'Fake DOM element - ' + resolverKey.domId ;
            }
        };
    }
}
var container = new microdi.Container();
container.addResolver('domResolver', new DomResolver());
// Note the usage of 'isResolverKey' so the container can distinguish this from a normal object.
// This is only required when you don't register a constructor function or prototype.
container.register('view', { resolver: 'domResolver', domId : 'theDomId', isResolverKey: true });
var view = container.resolve('view');
console.log(view.description);
```

Output:

```
Fake DOM element - theDomId

```

Here is an example where a concrete object is registered and a resolverKey is used to resolve a dependency of the registered item.

```javascript
class DomResolver {
    resolve(container, resolverKey) {
        // return a pretend dom element,
        return {
            get description() {
                return 'Fake DOM element - ' + resolverKey.domId ;
            }
        };
    }
}
var container = new microdi.Container();
container.addResolver('domResolver', new DomResolver());
class Controller {
    constructor(view) {
        console.log(view.description);
    }
}
// Note we don't need to specify the 'isResolverKey' property on the resolverKey.
// The container assumes it is as it appears in the dependency list.
container.register('controller', Controller).inject({ resolver: 'domResolver', domId : 'viewId' });
var controller = container.resolve('controller');
```

Output:

```
Fake DOM element - viewId
```

### Built in resolvers
There are 2 built in resolvers.

#### Delegate

This simply defers object creation to a delegate provided by the `resolverKey`.

```javascript
class Foo  {
    constructor(bar) {
        console.log('bar is : [%s]', bar);
    }
}
var container = new microdi.Container();
container.register('foo', Foo)
    .inject(
    {
        resolver: 'delegate',
        resolve: (container, resolveKey) => {
            return 'barInstance';
        }
    });
var foo = container.resolve('foo');
```

Output:

```
bar is : [barInstance]
```

#### Injection factory

Discussed [above](#injection-factories), this resolver injects a factory that can be called multiple times to create the dependency.
