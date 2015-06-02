import esp from '../../esp.js';

// note there are several concerns here that would exist in different areas of your architecture
// then are all together to demo the concepts.

// bootstrapping code
var router = new esp.Router();
router.registerModel(
    "modelId",
    {
        staticDataInitialised: false,
        price: 0,
        staticData: { }
    }
);

// price event processor code
router
    .getEventObservable('modelId', 'priceChanged')
    .do((model, event, eventContext) => console.log("price tick received"))
    .where((model, event, eventContext) => model.staticDataInitialised)
    .observe((model, event, eventContext)=> {
        console.log("Price tick received and static data loaded, applying margin");
        var margin = model.staticData.margin;
        model.price = event.newPrice += margin;
    }); // note: returns disposable which is throw away here

// static data initialisation event processor
router
    .getEventObservable('modelId', 'initialiseModel')
    .beginWork((model, event, eventContext, onResultsReceived) => {
        console.log("Getting static data");
        // fake up a backing service that returns static data results asynchronously
        var fakeStatic = [
            {
                name: 'pairs',
                value: ["EURUSD", "USDJPY"]
            },
            {
                name: 'margin',
                value: 2
            }
        ];
        var intervalId = setInterval(() => {
            let result = fakeStatic.shift();
            let isDone = fakeStatic.length === 0;
            console.log("Acync result received:" + result.name + ", isDone:" + isDone);
            onResultsReceived(result, isDone);
            if(isDone) {
                clearInterval(intervalId);
            }
        }, 3000);
    })
    .observe((model, event, ec)=> {
        console.log("Static data received:" + JSON.stringify(event.results));
        model.staticData[event.results.name] = event.results.value;
        if(event.isFinished) {
            console.log("Static data loaded:");
            model.staticDataInitialised = true;
        }
    }); // note: returns disposable which is throw away here

// backing service pushing prices into the router
var pumpPriceIntervalId = setInterval(() => {
    router.publishEvent('modelId', 'priceChanged', { newPrice: 10 });
}, 1000);

// model update observer code
router
    .getModelObservable('modelId')
    .observe(model => {
        console.log("Model: price '" + model.price + "', static initialised: " + model.staticDataInitialised);
        // stop the prices
        if(model.price > 0) {
            clearInterval(pumpPriceIntervalId);
        }
    }); // note: returns disposable which is throw away here

// more model update code
router
    .getModelObservable('modelId')
    .where(model => model.staticDataInitialised)
    .take(1)
    .observe(_ => {
        console.log("Displaying screen");
    }); // note: returns disposable which is throw away here

// bootstrapping code, kick off the system
router.publishEvent('modelId', 'initialiseModel', { /* noop */});