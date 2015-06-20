"use strict";

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt, {pattern: ['grunt-*']});

    var webpack = require('webpack');

    var headerBanner = grunt.file.read('LicenseHeader.txt');

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
        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: headerBanner
                },
                files: {
                    src: [ 'dist/**/*.js']
                }
            }
        },
        watch: {
            options: {
                atBegin: true
            },
            files: ['<%= jshint.src.files.src %>', '<%= jshint.tests.files.src %>', 'index.js'],
            tasks: ['jshint', 'karma:unit:run', 'webpack', 'babel', 'usebanner']
        }
    });

    grunt.registerTask('build', ['jshint', 'webpack', 'babel', 'usebanner']);
    grunt.registerTask('test', ['build', 'karma:release']);
    grunt.registerTask('dev', ['karma:unit:start', 'watch']);
    grunt.registerTask('default', ['test']);
};