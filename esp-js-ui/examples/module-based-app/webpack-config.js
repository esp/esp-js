var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');

var webpackConfig = {
    entry: {
        app: [
            __dirname + '/src/shell/shellBootstrapper.tsx'
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    output: {
        path: __dirname + '/build/',
        filename: 'app.js'
    },
    module: {
        rules: [
            { test: /\.avsc$/, loader: 'json-loader' },
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: __dirname +  '/src/index.template.html'
        })
    ],
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