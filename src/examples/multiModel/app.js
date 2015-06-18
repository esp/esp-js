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

import esp from '../../esp.js';

class ProductionLine {
    constructor() {
        this._cars = {};
        this._totalCarCost = 0;
    }
    get cars() {
        return this._cars;
    }
    get totalCarCost() {
        return this._totalCarCost;
    }
    addCar(id, car) {
        this._cars[id] = car;
        this.calculateTotalCarCost();
    }
    getCar(id) {
        return this._cars[id];
    }
    removeCar(id) {
        delete this._cars[id];
        this.calculateTotalCarCost();
    }
    calculateTotalCarCost() {
        var totalCarCost = 0;
        for(var p in this._cars) {
            if(this._cars.hasOwnProperty(p)) {
                totalCarCost += this._cars[p].cost;
            }
        }
        this._totalCarCost = totalCarCost;
    }
}

class Car {
    constructor(modelId, type) {
        this._modelId = modelId;
        this._type = type;
        this._cost = 0;
    }
    get id() {
        return this._modelId;
    }
    get type() {
        return this._type;
    }
    get cost() {
        return this._cost;
    }
    set cost(value) {
        this._cost = value;
    }
    get hasEngineUpgrade() {
        return this._hasEngineUpgrade;
    }
    set hasEngineUpgrade(value) {
        this._hasEngineUpgrade = value;
    }
    get hasSunroof() {
        return this._hasSunroof;
    }
    set hasSunroof(value) {
        this._hasSunroof = value;
    }
    calculateCost() {
        var cost = 100;
        if(this.hasEngineUpgrade) {
            cost += 10;
        }
        if(this.hasSunroof) {
            cost += 2;
        }
        this._cost = cost;
    }
}

class ProductionLineEventProcessor extends esp.model.DisposableBase {
    constructor(modelId, router) {
        super();
        this._modelId = modelId;
        this._router = router;
        this._carEventProcessors = {};
        this._carModelIdGenerator = function() {
            var id = 1;
            return () => "carId_"+id++;
        }();
    }
    observeEvents() {
        this._observeAddCarEvent();
        this._observeRemoveCarEvent();
        this._observeChildModelChanges();
    }
    _observeAddCarEvent() {
        this.addDisposable(
            this._router
                .getEventObservable("productionLineId", 'addCar')
                .observe((model, event) => {
                    var carModelId = this._carModelIdGenerator();
                    var carEventProcessor = new CarEventProcessor(carModelId, this._router);
                    this._carEventProcessors[carModelId] = carEventProcessor;
                    var car = new Car(carModelId, event.type);
                    model.addCar(carModelId, car);
                    carEventProcessor.observeEvents();
                    this._router.addChildModel("productionLineId", carModelId, car);
                })
        );
    }
    _observeRemoveCarEvent() {
        this.addDisposable(
            this._router
                .getEventObservable("productionLineId", 'removeCar')
                .observe((model, event) => {
                    var processor = this._carEventProcessors[event.carModelId];
                    processor.dispose();
                    delete this._carEventProcessors[event.carModelId];
                    this._router.removeModel(event.carModelId);
                    model.removeCar(event.carModelId);
                })
        );
    }
    _observeChildModelChanges() {
        this.addDisposable(
            this._router
                .getEventObservable("productionLineId", 'modelChangedEvent')
                .observe((model, event) => {
                    // if the car became defective call some service
                    var changedCar = model.getCar(event.childModelId);
                    console.log("car %s changed. Calculating costs", changedCar.type);
                    model.calculateTotalCarCost();
                })
        );
    }
}

class CarEventProcessor extends esp.model.DisposableBase {
    constructor(modelId, router) {
        super();
        this._modelId = modelId;
        this._router = router;
    }
    observeEvents() {
        this.addDisposable(
            this._router
                .getEventObservable(this._modelId, 'modifySpecsEvent')
                .observe((model, event) => {
                    console.log("processing modifySpecsEvent [%s]", JSON.stringify(event));
                    if(event.hasEngineUpgrade) {
                        model.hasEngineUpgrade = event.hasEngineUpgrade;
                    }
                    if(event.hasSunroof) {
                        model.hasSunroof = event.hasSunroof;
                    }
                    model.calculateCost();
                })
        );
    }
}

class ProductionLineController extends esp.model.DisposableBase  {
    constructor(productionLineId, router) {
        super();
        this._productionLineId = productionLineId;
        this._router = router;
        this._carControllers = {};
    }
    start() {
        this.addDisposable(
            router.getModelObservable(this._productionLineId).observe(model => {
                console.log("Model update received. Total car cost: %s", model.totalCarCost);

            })
        );
    }
    addCar(type) {
        console.log("Adding %s ----------", type);
        this._router.publishEvent(this._productionLineId, "addCar", { type: type });
    }
    removedCar(carId) {
        console.log("Removing %s ----------", type);
        router.publishEvent(this._productionLineId, "removeCar", { carModelId: carId });
    }
}

class CarController extends esp.model.DisposableBase  {
    constructor(carId, router) {
        super();
        this._carId = carId;
        this._router = router;
    }
    start() {
        this.addDisposable(
            router.getModelObservable(this._carId).observe(model => {
                console.log("Car %s model update received.", this._carId);
            })
        );
    }
    upgradEngine() {
        console.log("Upgrading engine on car %s ----------", this._carId);
        router.publishEvent(this._carId, "modifySpecsEvent", { hasEngineUpgrade: true });
    }
    addSunroof() {
        console.log("Addding sunroof to %s ----------", this._carId);
        router.publishEvent(this._carId, "modifySpecsEvent", { hasSunRoof: true });
    }
}

var router = new esp.Router();
router.registerModel("productionLineId", new ProductionLine());
var productionLineEventProcessor = new ProductionLineEventProcessor("productionLineId", router);
productionLineEventProcessor.observeEvents();

var productionLineController = new ProductionLineController("productionLineId", router);
productionLineController.start();

productionLineController.addCar("BMW");


console.log("Adding BMW ----------");
router.publishEvent("productionLineId", "addCar", { type: "BMW" });
router.publishEvent("carId_1", "modifySpecsEvent", { hasEngineUpgrade: true });
router.publishEvent("productionLineId", "removeCar", { carModelId: "carId_1" });
console.log();

console.log("Adding AUDI----------");
router.publishEvent("productionLineId", "addCar", { type: "AUDI" });
router.publishEvent("carId_2", "modifySpecsEvent", { hasEngineUpgrade: true });
console.log();

console.log("Adding HOLDEN----------");
router.publishEvent("productionLineId", "addCar", { type: "HOLDEN" });
router.publishEvent("carId_3", "modifySpecsEvent", { hasSunRoof: true });
