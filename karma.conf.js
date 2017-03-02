/*eslint-env node */
'use strict';

var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

module.exports = function (config) {
  config.set({
    browsers: [ 'Chrome' ], //run in Chrome
    singleRun: true, //just run once by default
    frameworks: [ 'jasmine' ],
    logLevel: config.LOG_DEBUG,
    files: [
       './tests/testIndex.ts'
    ],
    preprocessors: {
      './tests/testIndex.ts': [ 'webpack', 'sourcemap' ]
    },
    reporters: [ 'dots' ], //report results in this format
    webpack: {
      devtool: 'inline-source-map',
      module: webpackConfig.module,
      resolve: webpackConfig.resolve
    },
    webpackServer: {
      noInfo: true //please don't spam the console when running in karma!
    }
  });
};
