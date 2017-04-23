/*eslint-env node */
'use strict';

const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

let env = process.env.NODE_ENV || 'dev';
let isProduction = env.trim().toUpperCase() === 'prod';

console.log('Running in ' + env + ' environment.');

let plugins = [
    new CopyWebpackPlugin([{ from: 'src/**/*.less', to: 'styles/', flatten: true }]),
    new CleanWebpackPlugin('dist', {
      root: process.cwd(),
      verbose: true,
      dry: false
    }),
    new CleanWebpackPlugin('definitions', {
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

let config = {
    entry: {
        'esp-js-ui': './src/index.ts'
    },
    externals: {
        'rx': 'rx',
        'react': 'react',
        'classnames': 'classnames',
        'esp-js': 'esp-js',
        'esp-js-react': 'esp-js-react',
        'lodash': 'lodash',
        'microdi-js': 'microdi-js'
    },
    output: {
        path: process.cwd() + '/dist',
        libraryTarget: 'commonjs2',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
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
    plugins: plugins
};
module.exports = config;
