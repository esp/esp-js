'use strict';

// This plugin was originally this: https://www.npmjs.com/package/peer-deps-externals-webpack-plugin
// However it's gone stale and isn't working with webpack 5.
// Someone has pushed a PR to fix it, it can't be merged as the project is dead.
// I've copied the plugin here to use it locally.
// Source PR: https://github.com/Updater/peer-deps-externals-webpack-plugin/pull/8

const ExternalModuleFactoryPlugin = require('webpack/lib/ExternalModuleFactoryPlugin');

class PeerDepsExternalsPlugin {
    apply(compiler) {
        const peerDependencies = getPeerDependencies();

        // webpack 5+
        if (typeof compiler.options.output.library === 'object') {
            compiler.hooks.compile.tap('PeerDepsExternalsPlugin', ({ normalModuleFactory }) => {
                new ExternalModuleFactoryPlugin(
                    compiler.options.output.library.type,
                    peerDependencies
                ).apply(normalModuleFactory);
            });
        }
        // webpack 4+
        else {
            compiler.hooks.compile.tap('compile', params => {
                new ExternalModuleFactoryPlugin(
                    compiler.options.output.libraryTarget,
                    peerDependencies
                ).apply(params.normalModuleFactory);
            });
        }
    }
}

function getPeerDependencies() {
    try {
        const { resolve } = require('path');
        const pkg = require(resolve(process.cwd(), 'package.json'));
        return Object.keys(pkg.peerDependencies);
    } catch(err) {
        return [];
    }
}

module.exports = PeerDepsExternalsPlugin;