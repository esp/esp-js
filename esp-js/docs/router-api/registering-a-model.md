# Registering a model

In order for the `Router` to route events to a model, a model needs to be registered with it.
This is done by calling `router.AddModel()`.
The `Router` will hold onto the model instance until `router.RemoveModel(id)` is called.
When events are published the `Router` will hand out the model instance along with the event for processing.
When a change has been processed, the `Router` will hand out the model instance to model observers.

``` js
class Model {
}
// create a Router. It can manage multiple models.
var router = new esp.Router();
// register a model by id
router.addModel("myModel", new Model());

// ... at a later time when you're done with the model
router.removeModel("myModel");
```