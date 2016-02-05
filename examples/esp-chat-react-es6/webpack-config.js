var path = require("path");

var webpackConfig = {
    progress: true,
    failOnError: true,
    entry: {
        app: [
            './js/app.js'
        ]
    },
    output: {
        libraryTarget: 'umd',
        sourcePrefix: '    ',
        library: 'esp-example',
        path: './build/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                loader: "babel-loader",

                // Skip any files outside of your project's `src` directory
                include: [
                    path.resolve(__dirname, "js"),
                ],
                test: /\.jsx?$/,
                query: {
                    presets: ['es2015', 'stage-0', 'react'],
                    plugins: ['transform-runtime', 'transform-decorators-legacy']
                }
            }
        ]
    },
    devtool: 'source-map',
    devServer: {
        port: 4000,
        contentBase: path.join(__dirname, './'),
        stats: {
            colors: true
        },
        noInfo: false,
        quiet: false,
        hot: true
    }
};
module.exports = webpackConfig;
