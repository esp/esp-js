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

var runInjectionFactories = function runInjectionFactories() {
    var Item = function Item(name, otherDependencyA) {
        _classCallCheck(this, Item);

        this.name = name;
        this.otherDependencyA = otherDependencyA;
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
    container.registerInstance("otherDependencyA", "look! a string dependency here");
    container.register("item", Item, ["otherDependencyA"]).transient();
    container.register("manager", Manager, [{ type: "autoFactory", key: "item" }]);
    var manager = container.resolve("manager");
    var fooItem = manager.createItem("Foo");
    console.log("%s-%s", fooItem.name, fooItem.otherDependencyA);
    var barItem = manager.createItem("Bar");
    console.log("%s-%s", barItem.name, barItem.otherDependencyA);
};
runBasicExample();
runLifeTimeTypes();
runInjectionFactories();
