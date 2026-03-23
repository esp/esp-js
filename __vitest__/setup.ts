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

// Equivalent to the former __jest__/mocks/setupReactTestingLib.js
// Imports @testing-library/jest-dom matchers and extends Vitest's expect.
import '@testing-library/jest-dom/vitest';

// Re-implements the former __jest__/jest-fail-regression-fix.js.
// Jest's global fail() was removed; Vitest also doesn't ship it.
// Provide it as a global so existing tests that call fail() continue to work.
function fail(message: string = ''): never {
    throw new Error(`[FAIL] ${message}`.trim());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fail = fail;
