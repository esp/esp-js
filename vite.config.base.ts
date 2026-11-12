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

import { defineConfig, type UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * True when Vite is run as `vite build --watch` (i.e. the `dev` task).
 * Declaration generation is not needed during watch and, under concurrent
 * watchers, racing reads/writes of sibling `.dist/typings` produce spurious
 * TS2307 errors — so the dts plugin is skipped in this mode.
 */
export const isWatchBuild = process.argv.includes('--watch');

/**
 * Returns the `vite-plugin-dts` plugin, or nothing when running in watch mode.
 * Spread into a `plugins` array: `plugins: [...dtsPlugin({...})]`.
 */
export function dtsPlugin(options: Parameters<typeof dts>[0]) {
    return isWatchBuild ? [] : [dts(options)];
}

/**
 * Read peer dependencies from the package's own package.json and return
 * them as an array of package names — these are passed to rollupOptions.external
 * so they are never bundled into the UMD output.
 */
export function getPeerDepsExternal(packageDir: string = process.cwd()): string[] {
    try {
        const pkg = JSON.parse(
            readFileSync(resolve(packageDir, 'package.json'), 'utf-8')
        );
        return Object.keys(pkg.peerDependencies ?? {});
    } catch {
        return [];
    }
}

/**
 * Build a base Vite library-mode config for a given package.
 *
 * @param packageDir   Absolute path to the package directory (usually import.meta.dirname)
 * @param entry        Entry point relative to packageDir, e.g. 'src/index.ts'
 * @param bundleName   UMD global name, e.g. 'esp-js'
 * @param fileName     Output base filename without extension, e.g. 'esp-js'
 * @param extraConfig  Additional package-specific overrides merged on top
 */
export function createBaseConfig(
    packageDir: string,
    entry: string,
    bundleName: string,
    fileName: string
): UserConfig {
    const external = getPeerDepsExternal(packageDir);

    return defineConfig({
        build: {
            outDir: resolve(packageDir, '.dist'),
            emptyOutDir: true,
            sourcemap: true,
            minify: false,
            lib: {
                entry: resolve(packageDir, entry),
                name: bundleName,
                fileName: () => `${fileName}.js`,
                formats: ['umd', 'es'],
            },
            rollupOptions: {
                external,
                output: [
                    // Non-minified UMD
                    {
                        format: 'umd',
                        entryFileNames: `${fileName}.js`,
                        name: bundleName,
                        globals: buildGlobals(external),
                        plugins: [replaceNodeEnvPlugin('development')],
                    },
                    // Minified UMD — terser applied per-output
                    {
                        format: 'umd',
                        entryFileNames: `${fileName}.min.js`,
                        name: bundleName,
                        globals: buildGlobals(external),
                        plugins: [replaceNodeEnvPlugin('production'), terserPlugin()],
                    },
                    // ESM — tree-shakeable for bundlers. The .mjs extension lets Node load it as ESM
                    // (the packages are not "type": "module", so a .js file would be treated as CommonJS).
                    {
                        format: 'es',
                        entryFileNames: `${fileName}.esm.mjs`,
                    },
                ],
            },
        },
    });
}

/**
 * Build a globals map for UMD output from an array of external package names.
 * Converts package names to camelCase globals, e.g. 'esp-js' → 'espJs'.
 */
function buildGlobals(externals: string[]): Record<string, string> {
    const globals: Record<string, string> = {};
    for (const name of externals) {
        globals[name] = KNOWN_GLOBALS[name] ?? toCamelCase(name);
    }
    return globals;
}

/**
 * Packages whose UMD global isn't the camelCased package name.
 */
const KNOWN_GLOBALS: Record<string, string> = {
    'react': 'React',
    'react-dom': 'ReactDOM',
};

/**
 * Replaces process.env.NODE_ENV in a UMD output.
 * Bundled dependencies (e.g. immer, use-sync-external-store) reference it, and a UMD bundle
 * loaded by a plain <script> tag has no `process` global. The ESM output keeps the reference
 * so consumers' bundlers can still pick the dev or prod code path.
 */
function replaceNodeEnvPlugin(nodeEnv: 'development' | 'production') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const replace = require('@rollup/plugin-replace');
    return replace({
        preventAssignment: true,
        values: {'process.env.NODE_ENV': JSON.stringify(nodeEnv)},
    });
}

function toCamelCase(str: string): string {
    return str.replace(/[-/](.)/g, (_, c: string) => c.toUpperCase());
}

/**
 * Returns the rollup terser plugin for minified bundles.
 * Loaded lazily so non-minified builds don't pay the cost.
 */
function terserPlugin() {
    // rollup-plugin-terser or @rollup/plugin-terser can be used here.
    // We use the Vite built-in esbuild minification via a custom plugin shim.
    // Vite's own minify option cannot be applied per-output; instead we rely
    // on the vite-plugin-minify pattern: import @rollup/plugin-terser.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const terser = require('@rollup/plugin-terser');
    return terser({ compress: true, mangle: true });
}
