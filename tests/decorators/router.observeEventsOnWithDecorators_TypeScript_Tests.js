// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

const tsc = require('typescript');
const path = require ('path');
const fs = require ('fs');

describe('Router', function() {

    // This is somewhat of a HACK:
    // Typescript and babel generated different JS for decorators and as such
    // much pain has been had figuring out the lowest common denominator between the two transpilers.
    // The below code sucks in the ES6 JS and runs it through tsc so we can ensure the esp decorators work with it.
    // This is to avoid copying and pasting the test suite for esp decorators which is effectively the same.

    let compilerOptions = {
        allowJs: true,
        noImplicitAny: false,
        removeComments: false,
        preserveConstEnums: true,
        sourceMap: false,
        inlineSourceMap: true,
        inlineSources: true,
        noEmitOnError: true,
        jsx: "react",
        experimentalDecorators: true,
        target: "es6",
        module: "commonjs",
        noEmit: true,
        pretty: true
    };
    let filePath = path.join(__dirname, "router.observeEventsOnWithDecorators_ES6_Tests.js");
    let testSource = fs.readFileSync(filePath).toString();
    let testCompiled = tsc.transpile(
        testSource,
        compilerOptions,
        filePath,
        []
    );
    eval(testCompiled);
});