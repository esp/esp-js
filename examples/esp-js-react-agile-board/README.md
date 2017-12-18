# Evented State Processor (ESP) Agile Board Example 

This example demonstrates a simple agile planning board.
It uses both [esp-js](https://www.npmjs.com/package/esp-js) and [esp-js-react](https://www.npmjs.com/package/esp-js-react) to build a unidirectional, model first application.

![ESP Agile board Example](../../docs/images/esp-agile-demo.gif)

## Learning ESP

- [Documentation](http://keithwoods.gitbooks.io/esp-js/content)

### Get help from other users:
- [GitHub Issues](https://github.com/esp/esp-js/issues)

*Let us [know](https://github.com/esp/esp-js/issues) if you discover anything worth sharing!*

## Running

You must have [npm](https://www.npmjs.org/) or yarn installed on your computer.
From the root project directory run these commands from the command line:

`yarn install`

This will install all dependencies.

To build the project, first run this command:

`yarn start`

This will perform an initial build and bundle using webpack and typescript, it's then start webpacks dev server.
Webpack has typescript and JSX support built in so the final bundle is ready for consumption via a script tag.

Browse to [http://localhost:4000](http://localhost:4000) to view the app.

