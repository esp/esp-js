# Modelling Approaches

ESP encourages **model first development**, how you use the `Router` to build a model-first, event based system is the focus of this section.
Here we discuss some concepts worth noting, then go into detail on approaches.

Generally the decisions you face are these:

* How to route events to your model for processing
* How to structure your model
* How your model should react to cross cutting, or wide scoping, events

The following sections go into more details on these points using different approaches.

> ##### Tip
> Note the current recommended guidance is to use the [reactive domain model](./reactive-domain-model.md#reactive-model) approach.

* [Domain Model](domain-model.md)
* [Event Processor Domain Model](event-processor-domain-model.md)
* [Reactive Domain Model](reactive-domain-model.md)