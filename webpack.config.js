// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end
/*eslint-env node */
'use strict';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

let env = process.env.NODE_ENV || 'dev';
let isProduction = env.trim().toUpperCase() === 'prod';

console.log('Running in ' + env + ' environment.');

let plugins = [
    new CleanWebpackPlugin('dist', {
      root: process.cwd(),
      verbose: true,
      dry: false
    })
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
        'esp': './src/index'
    },
    mode: isProduction ? 'production' : 'development',
    output: {
        libraryTarget: 'umd',
        sourcePrefix: '    ',
        library: 'esp',
        path: process.cwd() + '/.dist',
        filename: 'esp.js',
        // webpack 4 incorrectly has `window` in the UMD definition
        // This is a workaround to enable node to consume esp's umc, see
        // https://github.com/webpack/webpack/issues/6522
        globalObject: "typeof self !== 'undefined' ? self : this"
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use:[{
                    loader: 'ts-loader',
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
