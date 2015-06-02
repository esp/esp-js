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

runBasicExample();