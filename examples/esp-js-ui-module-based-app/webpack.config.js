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

const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const baseConfig = require("../../webpack.config.base");

module.exports = {
    ...baseConfig,
    entry: {
        'esp-js-ui-module-based-app': './src/index.tsx'
    },
    module: {
        rules: [
            ...baseConfig.module.rules,
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
    plugins: [
        ...baseConfig.plugins,
        new HtmlWebpackPlugin({
            template: __dirname + '/src/index.template.html'
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    // Some issues with source-map-loader not supporting webpackurls:
    // https://github.com/webpack/webpack/discussions/17178#discussioncomment-5877003
    ignoreWarnings: [/Failed to parse source map/],
    devServer: {
        port: 4000,
        hot: true
    }
};

