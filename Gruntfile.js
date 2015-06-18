/*
 * Copyright 2015 Keith Woods
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

module.exports = function(grunt) {

    var webpack = require('webpack');

    require('load-grunt-tasks')(grunt, {pattern: ['grunt-*']});

    grunt.initConfig({
        jshint: {
            options: {
                node: true,
                laxbreak: true,
                esnext: true,
                globals: {
                    console: true
                }
            },
            src: {
                files: {
                    src:['Gruntfile.js', 'src/**/*.js']
                }
            },
            tests: {
                options: {
                    globals: {
                        describe   : true,
                        fdescribe   : true,
                        xdescribe   : true,
                        it         : true,
                        fit         : true,
                        xit         : true,
                        before     : true,
                        beforeEach : true,
                        after      : true,
                        afterEach  : true,
                        expect      : true,
                        pending     : true
                    }
                },
                files: {
                    src:['tests/**/*.js']
                }
            }
        },
        jsdoc : {
            dist : {
                src: ['src/*.js'],
                dest: 'dist/doc'
            }
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                runnerPort: 5020
            },
            unit    : {
                background: true,
                singleRun: false
            },
            release : {
                background: false,
                singleRun: true
            }
        },
        webpack: {
            options: {
                progress: true,
                failOnError: true,
                entry: './src/index.js',
                output: {
                    libraryTarget: 'umd',
                    sourcePrefix: '    ',
                    library: 'esp',
                    path: './dist/',
                    filename: 'esp.js'
                },
                module: {
                    loaders: [
                        // {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?experimental&optional=runtime'}
                        {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'}
                    ]
                }
            },
            debug: {
                devtool: 'source-map',
                module: {
                    preLoaders: [
                        {
                            test: /\.js$/,
                            loader: "source-map-loader"
                        }
                    ]
                },
                output: {
                    filename: 'esp.js'
                }
            },
            release: {
                output: {
                    filename: 'esp.min.js'
                },
                plugins: [
                    new webpack.optimize.UglifyJsPlugin({minimize: true}),
                    new webpack.optimize.OccurenceOrderPlugin(true)
                ]
            }
        },
        // only used for the examples, the rest of the code gets transpiled via a webpack loader
        "babel": {
            options: {
                sourceMap: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/examples',
                    src: ['**/*.js'],
                    dest: 'dist/examples'
                }]
            }
        },
        watch: {
            options: {
                atBegin: true
            },
            files: ['<%= jshint.src.files.src %>', '<%= jshint.tests.files.src %>', 'index.js'],
            tasks: ['jshint', 'karma:unit:run', 'webpack', 'babel']
        }
    });

    grunt.registerTask('build', ['jshint', 'webpack', 'babel']);
    grunt.registerTask('test', ['build', 'karma:release']);
    grunt.registerTask('dev', ['karma:unit:start', 'watch']);
    grunt.registerTask('default', ['test']);
};