"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var esp = _interopRequire(require("../../esp-js.js"));

var ModelBootstrapper = _interopRequire(require("./model/ModelBootstrapper"));

var MainController = _interopRequire(require("./controllers/MainController"));

var router = new esp.Router();
var mainController = new MainController(router);
var modelBootstrapper = new ModelBootstrapper(router);

mainController.start();
modelBootstrapper.start();