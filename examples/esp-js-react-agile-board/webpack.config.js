/*eslint-env node */
'use strict';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

let config = {
    entry: {
        'esp-js-react-agile-board': './src/app.tsx'
    },
    output: {
        path: process.cwd() + '/dist',
        libraryTarget: 'umd',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use:[{
                    loader: 'awesome-typescript-loader',
                }]
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                enforce: 'pre',
                use:[{
                    loader: 'tslint-loader',
                    options: {
                        failOnHint: true
                    }
                }]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin('dist', {
            root: process.cwd(),
            verbose: true,
            dry: false
        }),
        new HtmlWebpackPlugin({
            template: __dirname +  '/index.html'
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
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
module.exports = config;
