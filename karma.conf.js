module.exports = function (config) {
    var configuration = {
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'tests/testIndex.js'
        ],
        exclude: [],
        preprocessors: {
            'tests/testIndex.js': ['webpack']
        },
        webpack: {
            watch: false,
            devtool: "eval",
            module: {
                loaders: [
                    {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader?sourceMap=true'}
                ]
            }
        },
        reporters: ['progress'],
        port: 5010,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false,
        plugins: [
            require("karma-jasmine"),
            require("karma-chrome-launcher"),
            require("karma-webpack")
        ],
        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
    };
    // http://stackoverflow.com/questions/19255976/how-to-make-travis-execute-angular-tests-on-chrome-please-set-env-variable-chr
    if (process.env.TRAVIS) {
        configuration.browsers = ['Chrome_travis_ci'];
        configuration.singleRun = true;
    }
    config.set(configuration);
};
