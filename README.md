[![Build Status](https://travis-ci.org/esp/esp-js.svg?branch=master)](https://travis-ci.org/esp/esp-js)
[![npm](https://img.shields.io/npm/v/esp-js.svg)](https://www.npmjs.com/package/esp-js)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

# Evented State Processor (ESP)

ESP gives you the ability to manage changes to a model in a deterministic event driven manner.
It does this by adding specific processing workflow around changes to a model's state. 
It was born out of the need to manage complex UI and/or server state.

At its core is a `Router` which sits between event publishers and the model.
Those wanting to change the model publish events to the `Router`.
The model observes the events and applies the changes.
The model is then dispatched to model observers so new state can be applied.
It's lightweight, easy to apply and puts the model at the forefront of your design.

# ESP 2.0
ESP 2.0 adds a host of other additional libraries to help you build composite single page application with React.
It allows you to use either OO, and/or immutable pattens (Redux like) for modeling independent and decoupled screens within your composite application.
Features include:

* The core event router (esp-js)
* Dependency injection container (esp-js-di)
* Module loading system (esp-js-ui) and composite application toolbox
* React support (esp-js-ui)
* Immutable state models (esp-js-polimer)    

It's built on typescript and exposes the full type definitions.

# Documentation

[https://esp.github.io/](http://https://esp.github.io/)