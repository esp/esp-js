var path = require("path");

module.exports = [ {
        progress: true,
        failOnError: true,
        entry: './js/app.js',
        output: {
            libraryTarget: 'umd',
            sourcePrefix: '    ',
            library: 'esp-example',
            path: './js/',
            filename: 'bundle.js'
        },
        module: {
            loaders: [
                // {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?experimental&optional=runtime'}
                {test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader'}
            ]
        },
        devtool: 'source-map'
    }
];
