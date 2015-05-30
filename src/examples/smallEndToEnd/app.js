"use strict";

import esp from '../../esp-js.js';
import ModelBootstrapper from './model/ModelBootstrapper';
import MainController from './controllers/MainController';

var router = new esp.Router();
var mainController = new MainController(router);
var modelBootstrapper = new ModelBootstrapper(router);

mainController.start();
modelBootstrapper.start();
