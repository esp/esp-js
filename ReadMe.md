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
However without such a system all is not lost, we can simply use string [identifiers](#identifiers) to id objects to construct.

## The Dependency List
The dependency list is an array of dependencies required to build the instance being registered.
Each item in the dependency list represens a dependency to be injected into the instance that will be build.
The order of the items in the list matches the order of the items listed in the items constructor (be it a objects or ctor function). 
The list can contain both [identifiers](#identifiers) of other registrations and/or [dependency resolvers](#dependency-resolvers).
Identifiers of other registrations simply means, resolve the other dependency by it's identifier and inject that . 
The dependency resolver add functionality to how the container will acquire and build the dependency that is to be injected.   
 
### Dependency Resolvers

### Built in resolvers
#### Factory
#### Auto Factory

### Add your own resolvers

## Lifetime management

## Child containers

### Overriding Registrations

## Lifetime management in child containers
 
## Instance Disposal

