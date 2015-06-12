"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _microdiJs = require("../microdi.js");

var _microdiJs2 = _interopRequireDefault(_microdiJs);

var runBasicExample = function runBasicExample() {
    var Child = (function () {
        function Child() {
            _classCallCheck(this, Child);
        }

        _createClass(Child, [{
            key: "sayHello",
            value: function sayHello() {
                console.log("Hello from the child");
            }
        }]);

        return Child;
    })();

    var Parent = (function () {
        function Parent(child) {
            _classCallCheck(this, Parent);

            this._child = child;
        }

        _createClass(Parent, [{
            key: "sayHello",
            value: function sayHello() {
                console.log("Hello from the parent");
                this._child.sayHello();
            }
        }]);

        return Parent;
    })();

    var container = new _microdiJs2["default"].Container();
    container.register("child", Child);
    container.register("parent", Parent, ["child"]);
    var parent = container.resolve("parent");
    parent.sayHello();
};

var runLifeTimeTypes = function runLifeTimeTypes() {
    var container = new _microdiJs2["default"].Container();

    console.log("Singleton");
    var Foo = {};
    container.register("theFoo", Foo).singleton();
    var foo1 = container.resolve("theFoo");
    var foo2 = container.resolve("theFoo");
    console.log(foo1 == foo2); // true

    console.log("Singleton per container");
    var Bar = {};
    container.register("theBar", Bar).singletonPerContainer();
    var bar1 = container.resolve("theBar");
    var bar2 = container.resolve("theBar");
    var childContainer = container.createChildContainer();
    var bar3 = childContainer.resolve("theBar");
    var bar4 = childContainer.resolve("theBar");
    console.log(bar1 == bar2); // true
    console.log(bar2 == bar3); // false
    console.log(bar3 == bar4); // true

    console.log("Transient");
    var Baz = {};
    container.register("theBaz", Foo).transient();
    var baz1 = container.resolve("theBaz");
    var baz2 = container.resolve("theBaz");
    console.log(baz1 == baz2); // false

    console.log("External");
    var Disposable = {
        init: function init() {
            this.isDisposed = false;
            return this;
        },
        dispose: function dispose() {
            this.isDisposed = true;
        }
    };
    container.registerInstance("disposable1", Object.create(Disposable).init());
    container.register("disposable2", Disposable);
    var disposable1 = container.resolve("disposable1");
    var disposable2 = container.resolve("disposable2");
    container.dispose();
    console.log(disposable1.isDisposed); // false
    console.log(disposable2.isDisposed); // true
};

var runGroups = function runGroups() {
    console.log("Groups");
    var Foo = {
        name: "theFoo"
    };
    var Bar = {
        name: "theBar"
    };
    var container = new _microdiJs2["default"].Container();
    container.register("foo", Foo).inGroup("group1");
    container.register("bar", Bar).inGroup("group1");
    var group1 = container.resolveGroup("group1");
    for (var i = 0, len = group1.length; i < len; i++) {
        console.log(group1[i].name);
    }
};

var runResolutionWithAdditionalDependencies = function runResolutionWithAdditionalDependencies() {
    console.log("Resolution with additional dependencies");

    var Foo = function Foo(fizz, bar, bazz) {
        _classCallCheck(this, Foo);

        console.log("%s %s %s", fizz.name, bar.name, bazz.name);
    };

    var container = new _microdiJs2["default"].Container();
    container.register("fizz", { name: "fizz" });
    container.register("foo", Foo, ["fizz"]);
    var foo = container.resolve("foo", { name: "bar" }, { name: "bazz" });
};

var runInjectionFactories = function runInjectionFactories() {
    console.log("injection factories");

    var Item = function Item() {
        _classCallCheck(this, Item);

        console.log("creating an item");
    };

    var Manager = (function () {
        function Manager(itemFactory) {
            _classCallCheck(this, Manager);

            this._itemFactory = itemFactory;
        }

        _createClass(Manager, [{
            key: "createItem",
            value: function createItem(name) {
                return this._itemFactory(name);
            }
        }]);

        return Manager;
    })();

    var container = new _microdiJs2["default"].Container();
    container.register("item", Item).transient();
    container.register("manager", Manager, [{ resolver: "factory", key: "item" }]);
    var manager = container.resolve("manager");
    var item1 = manager.createItem();
    var item2 = manager.createItem();
};

var runInjectionFactoriesWithOverrides = function runInjectionFactoriesWithOverrides() {
    console.log("injection factories with overrides");

    var Item = function Item(name) {
        _classCallCheck(this, Item);

        console.log("Hello " + name);
    };

    var Manager = (function () {
        function Manager(itemFactory) {
            _classCallCheck(this, Manager);

            this._itemFactory = itemFactory;
        }

        _createClass(Manager, [{
            key: "createItem",
            value: function createItem(name) {
                return this._itemFactory(name);
            }
        }]);

        return Manager;
    })();

    var container = new _microdiJs2["default"].Container();
    container.register("item", Item).transient();
    container.register("manager", Manager, [{ resolver: "factory", key: "item" }]);
    var manager = container.resolve("manager");
    var item1 = manager.createItem("Bob");
    var item2 = manager.createItem("Mick");
};

var runInjectionFactoriesWithOverridesAndDependencies = function runInjectionFactoriesWithOverridesAndDependencies() {
    console.log("injection factories with overrides and other dependencies");

    var Item = function Item(otherDependencyA, name) {
        _classCallCheck(this, Item);

        console.log("Hello " + name + ". Other dependency: " + otherDependencyA);
    };

    var Manager = (function () {
        function Manager(itemFactory) {
            _classCallCheck(this, Manager);

            this._itemFactory = itemFactory;
        }

        _createClass(Manager, [{
            key: "createItem",
            value: function createItem(name) {
                return this._itemFactory(name);
            }
        }]);

        return Manager;
    })();

    var container = new _microdiJs2["default"].Container();
    container.registerInstance("otherDependencyA", "look! a string dependency");
    container.register("item", Item, ["otherDependencyA"]).transient();
    container.register("manager", Manager, [{ resolver: "factory", key: "item" }]);
    var manager = container.resolve("manager");
    var fooItem = manager.createItem("Foo");
    var barItem = manager.createItem("Bar");
};

var runChildContainer = function runChildContainer() {
    console.log("Child containers");
    var Foo = {};
    var container = new _microdiJs2["default"].Container();
    var childcontainer = container.createChildContainer();
    container.register("foo", Foo); // defaults to singleton registration
    var foo1 = container.resolve("foo");
    var foo2 = childcontainer.resolve("foo");
    console.log(foo1 == foo2); // true, same instance

    container.register("fooAgain", Foo).singletonPerContainer();
    var foo3 = container.resolve("fooAgain");
    var foo4 = childcontainer.resolve("fooAgain");
    console.log(foo3 == foo4); // false, different instance
    var foo5 = childcontainer.resolve("fooAgain");
    console.log(foo4 == foo5); // true, same instance
};

var runChildContainerRegistrations = function runChildContainerRegistrations() {
    console.log("Child container registrations");
    var Foo = {};
    var container = new _microdiJs2["default"].Container();
    container.register("foo", Foo); // defaults to singleton registration

    var childcontainer = container.createChildContainer();
    childcontainer.register("foo", Foo).transient();

    var foo1 = container.resolve("foo");
    var foo2 = container.resolve("foo");
    console.log(foo1 == foo2); // true, same instance

    var foo3 = childcontainer.resolve("foo");
    console.log(foo2 == foo3); // false, different instance

    var foo4 = childcontainer.resolve("foo");
    console.log(foo3 == foo4); // false, different instance
};

var runDisposal = function runDisposal() {
    console.log("Container disposal");

    var Foo = (function () {
        function Foo() {
            _classCallCheck(this, Foo);
        }

        _createClass(Foo, [{
            key: "dispose",
            value: function dispose() {
                console.log("foo disposed");
            }
        }]);

        return Foo;
    })();

    var container = new _microdiJs2["default"].Container();

    container.register("foo", Foo).singletonPerContainer();
    var foo1 = container.resolve("foo");

    var childcontainer = container.createChildContainer();
    var foo2 = childcontainer.resolve("foo");

    container.dispose();
};

var runCustomDependencyResolver = function runCustomDependencyResolver() {
    console.log("Custom dependency resolver");

    var DomResolver = (function () {
        function DomResolver() {
            _classCallCheck(this, DomResolver);
        }

        _createClass(DomResolver, [{
            key: "resolve",
            value: function resolve(container, resolverKey) {
                // return a pretend dom elemenet,
                return Object.defineProperties({}, {
                    description: {
                        get: function () {
                            return "Fake DOM element - " + resolverKey.domId;
                        },
                        configurable: true,
                        enumerable: true
                    }
                });
            }
        }]);

        return DomResolver;
    })();

    var container = new _microdiJs2["default"].Container();
    container.addResolver("domResolver", new DomResolver());
    // Note the usage of 'isResolverKey' so the container can distingush this from a normal object.
    // This is only required when you don't register a constructor function or prototype.
    container.register("view", { resolver: "domResolver", domId: "theDomId", isResolerKey: true });
    var view = container.resolve("view");
    console.log(view.description);
};

var runCustomDependencyResolver2 = function runCustomDependencyResolver2() {
    console.log("Custom dependency resolver 2");

    var DomResolver = (function () {
        function DomResolver() {
            _classCallCheck(this, DomResolver);
        }

        _createClass(DomResolver, [{
            key: "resolve",
            value: function resolve(container, resolverKey) {
                // return a pretend dom elemenet,
                return Object.defineProperties({}, {
                    description: {
                        get: function () {
                            return "Fake DOM element - " + resolverKey.domId;
                        },
                        configurable: true,
                        enumerable: true
                    }
                });
            }
        }]);

        return DomResolver;
    })();

    var container = new _microdiJs2["default"].Container();
    container.addResolver("domResolver", new DomResolver());

    var Controller = function Controller(view) {
        _classCallCheck(this, Controller);

        console.log(view.description);
    };

    // Note we don't need to specift the 'isResolerKey' property on the resolverkey.
    // The container assumes it is as it appears in the dependency list.
    container.register("controller", Controller, [{ resolver: "domResolver", domId: "viewId" }]);
    var controller = container.resolve("controller");
};

var runDelegeateResolver = function runDelegeateResolver() {
    console.log("Delegate resolver");

    var Foo = function Foo(bar) {
        _classCallCheck(this, Foo);

        console.log("bar is : [%s]", bar);
    };

    var container = new _microdiJs2["default"].Container();
    container.register("foo", Foo, [{
        resolver: "delegate",
        resolve: function resolve(container, resolveKey) {
            return "barInstance";
        }
    }]);
    var foo = container.resolve("foo");
};

runBasicExample();
runLifeTimeTypes();
runInjectionFactories();
runInjectionFactoriesWithOverrides();
runInjectionFactoriesWithOverridesAndDependencies();
runGroups();
runResolutionWithAdditionalDependencies();
runChildContainer();
runChildContainerRegistrations();
runDisposal();
runCustomDependencyResolver();
runCustomDependencyResolver2();
runDelegeateResolver();
