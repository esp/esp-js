"use strict";

// https://www.bountysource.com/issues/4280633-producing-a-single-test-bundle
var testsContext = require.context(".", true, /Tests.js$/);
testsContext.keys().forEach(testsContext);