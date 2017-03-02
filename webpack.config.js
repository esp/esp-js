/*eslint-env node */
'use strict';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const failPlugin = require('webpack-fail-plugin');
const webpack = require('webpack');
const path = require('path');

let env = process.env.NODE_ENV || 'dev';
let isProduction = env.trim().toUpperCase() === 'prod';
let isDevelopment = !isProduction;

console.log('Running in ' + env + ' environment.');

let loaders = [
    {
        test: /\.json$/,
        exclude: /(lib|node_modules)/,
        loaders: ['json']
    },
    {
        loaders: ['awesome-typescript-loader'],
        test: /\.tsx?$/,
        exclude: /node_modules/
    }
];

let plugins = [
    failPlugin,
    new webpack.optimize.OccurenceOrderPlugin(true),
    new CleanWebpackPlugin('dist', {
      root: process.cwd(),
      verbose: true,
      dry: false
    })
];

if(isProduction) {
    plugins.push(new webpack.optimize.DedupePlugin());
    plugins.push(new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }));

    // Doesn't work with es6 output
    // plugins.push(new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   },
    //   output: {
    //     comments: false
    //   },
    //   sourceMap: true
    // }));
  }

let preLoaders = [
    {
        test: /(\.tsx?)$/,
        loader: 'tslint-loader',
        exclude: /node_modules|generated/
    }
];
let aliases = {
    'stompjs': __dirname + '/src/messaging/lib/stompjs'
};

let config = {
    tslint: {
        failOnHint: true
    },
    entry: {
        'accelfin': './src/index.ts',
        'core': ['./src/core/index.ts'],
        'messaging': ['./src/messaging/index.ts']
    },
    externals: {
        'rx': 'rx',
        'esp-js': 'esp-js',
        'google-protobuf': 'google-protobuf'
    },
    output: {
        path: './dist',
        libraryTarget: 'commonjs2',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.ts', '.tsx', '.js', '.json'],
        alias: aliases
    },
    module: {
        preLoaders: preLoaders,
        loaders: loaders
    },
    plugins: plugins
};

module.exports = config;
