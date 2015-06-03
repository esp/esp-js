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
                    console: true,
                    _ : true
                }
            },
            src: {
                files: {
                    src:['Gruntfile.js', 'src/**/*.js', './index.js']
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
                entry: './index.js',
                output: {
                    libraryTarget: 'umd',
                    sourcePrefix: '    ',
                    library: 'microdi',
                    path: './dist/',
                    filename: 'microdi.js'
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
                    filename: 'microdi.js'
                }
            },
            release: {
                output: {
                    filename: 'microdi.min.js'
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
            files: ['<%= jshint.src.files.src %>', '<%= jshint.tests.files.src %>'],
            tasks: ['jshint', 'karma:unit:run', 'webpack', 'babel']
        }
    });

    grunt.registerTask('dev', ['karma:unit:start', 'watch']);
    grunt.registerTask('default', ['jshint', 'karma:release', 'webpack', 'babel']);
};