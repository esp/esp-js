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
import { readFileSync } from 'fs';
import { resolve } from 'path';

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
                    },
                    // Minified UMD — terser applied per-output
                    {
                        format: 'umd',
                        entryFileNames: `${fileName}.min.js`,
                        name: bundleName,
                        globals: buildGlobals(external),
                        plugins: [terserPlugin()],
                    },
                    // ESM (bonus — tree-shakeable for bundler consumers)
                    {
                        format: 'es',
                        entryFileNames: `${fileName}.esm.js`,
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
        globals[name] = toCamelCase(name);
    }
    return globals;
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
