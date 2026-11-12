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

import { defineConfig, type UserConfig } from 'vitest/config';
import { mergeConfig } from 'vite';
import { resolve } from 'path';

/**
 * Absolute path to the shared vitest setup file.
 * Using __dirname (CJS-compatible) instead of import.meta.url.
 */
const sharedSetup = resolve(__dirname, '__vitest__/setup.ts');

// Base Vitest configuration shared by all packages.
// - environment: jsdom   — matches the previous Jest jsdom environment
// - include pattern      — mirrors Jest testMatch: tests dir, *Tests.[jt]s?(x) files
// - globals: true        — provides describe/it/expect/vi as globals (no import needed)
// - setupFiles           — equivalent to Jest's setupFiles + setupFilesAfterEnv
export const baseVitestConfig: UserConfig = defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        environmentOptions: {
            jsdom: {
                url: 'http://localhost/',
            },
        },
        include: ['**/tests/**/*Tests.[jt]s?(x)'],
        setupFiles: [sharedSetup],
        coverage: {
            provider: 'v8',
        },
    },
});

/**
 * Merge a package-specific config on top of the base config.
 * Each package's vitest.config.ts calls this helper.
 */
export function createVitestConfig(packageConfig: UserConfig = {}): UserConfig {
    return mergeConfig(baseVitestConfig, packageConfig);
}
