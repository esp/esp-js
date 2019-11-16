var isWindows = require('is-os').isWindows();
module.exports = {
    scripts: {
        // Scripts shared by each package under examples & packages
        dev: 'cross-env NODE_ENV=dev webpack --display "normal" --color --watch',
        buildDev: 'cross-env NODE_ENV=dev webpack --display-reasons --display-error-details --color && yarn test-ci',
        buildProd: 'cross-env NODE_ENV=prod webpack --display-reasons --display-error-details --color && yarn test-ci',
        buildPack: 'cross-env NODE_ENV=prod yarn pack',
        buildDocs: 'cross-env NODE_ENV=dev BUILD_DOCS=true webpack --display-reasons --display-error-details --color',
        // "build-docs-markdown": "../../node_modules/.bin/typedoc --out './docs' --exclude '**/node_modules/**/*.*' --target es6 --experimentalDecorators --module commonjs --tsconfig ./tsconfig.json --excludeExternals --excludeNotExported --excludePrivate --plugin typedoc-plugin-markdown src typings",
        testCi: 'jest --verbose --color --no-cache -c ./jest.config.js --rootDir .',
        clean: isWindows
            ? 'rmdir -r ./.dist && rmdir -r ./.tsbuild && del /s /q esp*.tgz'
            : 'rm -rf ./.dist && rm -rf ./.tsbuild && find . -name esp*.tgz -delete',
        // Scrips only called from the root package.json
        trash: isWindows
            ? 'echo \'Trash script not supported on windows\''
            : './scripts/trash.sh && lerna run clean && lerna clean && rm -rf ./node_modules',
        publishAll: 'yarn clean && yarn build-prod && lerna publish',
        createPackage: 'yarn clean && yarn build-prod && lerna run build-pack'
    }
};