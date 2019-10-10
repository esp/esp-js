// https://babeljs.io/docs/en/config-files#monorepos
module.exports = function (api) {
    api.cache(true);
    const presets = [
        ["@babel/preset-env", {
            "targets": {
                "node": true
            }
        }],
        ["@babel/preset-react"]
    ];
    const plugins = [
        ["@babel/plugin-transform-runtime"],
        ["@babel/plugin-proposal-decorators", {"legacy": true}],
        ["@babel/plugin-proposal-class-properties", {"loose": true}],
        ["@babel/plugin-transform-flow-strip-types"]
    ];
    return {
        presets,
        plugins
    };
};