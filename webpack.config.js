/*eslint-env node */
'use strict';

const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const failPlugin = require('webpack-fail-plugin');
const webpack = require('webpack');
const path = require('path');

let env = process.env.NODE_ENV || 'dev';
let isProduction = env.trim().toUpperCase() === 'prod';

console.log('Running in ' + env + ' environment.');

let rules = [
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
];

let plugins = [
    failPlugin,
    new CopyWebpackPlugin([{ from: 'src/**/*.less', to: 'styles/', flatten: true }]),
    new CleanWebpackPlugin('dist', {
      root: process.cwd(),
      verbose: true,
      dry: false
    }),
];

if(isProduction) {
    plugins.push(new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }));
}
let alias = {
    'stompjs': __dirname + '/src/messaging/lib/stompjs'
};

let config = {
    entry: {
        'accelfin': './src/index.ts',
        'core': ['./src/core/index.ts'],
        'ui': ['./src/ui/index.ts']
    },
    externals: {
        'rx': 'rx',
        'react': 'react',
        'classnames': 'classnames',
        'esp-js': 'esp-js',
        'esp-js-react': 'esp-js-react',
        'microdi-js': 'microdi-js',
        'lodash': 'lodash',
        'google-protobuf': 'google-protobuf'
    },
    output: {
        path: process.cwd() + '/dist',
        libraryTarget: 'commonjs2',
        filename: '[name].js'
    },
    resolve: {
        alias,
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    module: {
        rules: rules
    },
    plugins: plugins
};
module.exports = config;
