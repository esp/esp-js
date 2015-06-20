"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// notice_start
/*
 * Copyright 2015 Keith Woods
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

var esp = _interopRequire(require("../../esp.js"));

// note there are several concerns here that would exist in different areas of your architecture
// then are all together to demo the concepts.

// bootstrapping code
var router = new esp.Router();
router.registerModel("modelId", {
    staticDataInitialised: false,
    price: 0,
    staticData: {}
});

// price event processor code
router.getEventObservable("modelId", "priceChanged")["do"](function (model, event, eventContext) {
    return console.log("price tick received");
}).where(function (model, event, eventContext) {
    return model.staticDataInitialised;
}).observe(function (model, event, eventContext) {
    console.log("Price tick received and static data loaded, applying margin");
    var margin = model.staticData.margin;
    model.price = event.newPrice += margin;
}); // note: returns disposable which is throw away here

// static data initialisation event processor
router.getEventObservable("modelId", "initialiseModel").beginWork(function (model, event, eventContext, onResultsReceived) {
    console.log("Getting static data");
    // fake up a backing service that returns static data results asynchronously
    var fakeStatic = [{
        name: "pairs",
        value: ["EURUSD", "USDJPY"]
    }, {
        name: "margin",
        value: 2
    }];
    var intervalId = setInterval(function () {
        var result = fakeStatic.shift();
        var isDone = fakeStatic.length === 0;
        console.log("Acync result received:" + result.name + ", isDone:" + isDone);
        onResultsReceived(result, isDone);
        if (isDone) {
            clearInterval(intervalId);
        }
    }, 3000);
}).observe(function (model, event, ec) {
    console.log("Static data received:" + JSON.stringify(event.results));
    model.staticData[event.results.name] = event.results.value;
    if (event.isFinished) {
        console.log("Static data loaded:");
        model.staticDataInitialised = true;
    }
}); // note: returns disposable which is throw away here

// backing service pushing prices into the router
var pumpPriceIntervalId = setInterval(function () {
    router.publishEvent("modelId", "priceChanged", { newPrice: 10 });
}, 1000);

// model update observer code
router.getModelObservable("modelId").observe(function (model) {
    console.log("Model: price '" + model.price + "', static initialised: " + model.staticDataInitialised);
    // stop the prices
    if (model.price > 0) {
        clearInterval(pumpPriceIntervalId);
    }
}); // note: returns disposable which is throw away here

// more model update code
router.getModelObservable("modelId").where(function (model) {
    return model.staticDataInitialised;
}).take(1).observe(function (_) {
    console.log("Displaying screen");
}); // note: returns disposable which is throw away here

// bootstrapping code, kick off the system
router.publishEvent("modelId", "initialiseModel", {});
/* noop */