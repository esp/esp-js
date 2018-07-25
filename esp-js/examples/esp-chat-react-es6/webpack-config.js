var path = require("path");

var webpackConfig = {
    entry: {
        app: [
            './js/app.jsx'
        ]
    },
    mode: 'development',
    output: {
        libraryTarget: 'umd',
        sourcePrefix: '    ',
        library: 'esp-example',
        path: process.cwd() + '/build',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },
    module: {
        rules: [
            { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },
    devtool: 'source-map'
};
module.exports = webpackConfig;
