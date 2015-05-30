// not sure why this doesn't work:
//export { default as EventStage } from './EventStage';
//export { default as Router } from './Router';
//export * from './model/index';
// this one won't work either
//import EventStage from './EventStage';
//import Router from './Router';
//import model from './model/index';
//export { EventStage, Router, model };
exports.EventStage = require('./EventStage');
exports.Router = require('./Router');
exports.model = require('./model');

