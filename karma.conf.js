module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'tests/testIndex.js'
    ],
    exclude: [
    ],
    preprocessors: {
      'tests/testIndex.js': ['webpack']
    },
    webpack: {
        watch: false,
        devtool: "eval",
        module: {
            loaders: [
                { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader?sourceMap=true'}
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
    ]
  });
};
