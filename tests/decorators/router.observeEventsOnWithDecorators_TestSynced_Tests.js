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

describe('Decorators', () => {

    function _getFileContents(filename) {
        let filePath = path.join(__dirname, filename);
        return fs.readFileSync(filePath).toString()
    }

    it('Decorator tests should be the same', () => {
        // NOTE teh below tests are copied into a few files as they need to run via different transpilers.
        // I could have a single file, then source the tests and using eval to run them thus not having to copy and past this file, however debugging tests for each transpiler gets really hard.
        let bableTests = _getFileContents("router.observeEventsOnWithDecorators_Babel_Tests.js");
        let typescriptES5Tests = _getFileContents("router.observeEventsOnWithDecorators_ES5_Tests.ts");
        let typescriptES6Tests = _getFileContents("router.observeEventsOnWithDecorators_ES6_Tests.ts");
        let testFilesAreTheSame = bableTests === typescriptES5Tests && typescriptES5Tests === typescriptES6Tests;
        expect(testFilesAreTheSame).toEqual(true);
    });
});
