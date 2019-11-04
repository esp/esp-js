# Evented State Processor (ESP) Agile Board Example 

This example demonstrates a simple agile planning board.
It uses both [esp-js](https://www.npmjs.com/package/esp-js) and [esp-js-react](https://www.npmjs.com/package/esp-js-react) to build a unidirectional, model first application.

The model is an OO style model.

![ESP Agile board Example](../../docs/images/esp-agile-demo.gif)

## Running

You must have [yarn](https://yarnpkg.com/) or yarn installed on your computer.

From the root directory of the repo first do a yarn install:

`yarn install`

This will install all dependencies and setup the mono repo structure.

Next build all the esp packages:

`yarn build-dev`
 
Then cd into the example you want to run:

`cd example/the-example-directory`

And finally start the example:

`yarn start`

Browse to [http://localhost:4000](http://localhost:4000) to view the example.

