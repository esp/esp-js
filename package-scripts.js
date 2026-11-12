module.exports = {
    scripts: {
        // Scripts shared by each package under packages/
        dev: 'vite build --watch',
        'build-dev': 'vite build && vitest run',
        'build-prod': 'vite build && vitest run',
        'build-pack': 'npm pack',
        test: 'vitest --watch',
        'test-ci': 'vitest run',
        clean: `rm -rf ./.dist && rm -rf ./.tsbuild && find . -maxdepth 1 -name 'esp*.tgz' -delete`,
    }
};
