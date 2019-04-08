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
const npath = require ('path');
const tsconfig = require('../tsconfig.json');
// const tsconfig = require(path.resolve('.', 'tsconfig.json'));

/*
*
*  types?: string[];
* typeRoots?: string[];
* jsx
*/

let compilerOptions = tsconfig.compilerOptions;
// source maps don't work well on the latest of node/tsc/jest/idea, it's a
// game of pick the settings that work across everything, even then it doesn't really work at times
// It seems the idea needs the following re-configured so it picks up source maps
compilerOptions.rootDir = undefined;
compilerOptions.outDir = undefined;
compilerOptions.sourceMap = undefined;
compilerOptions.inlineSourceMap = true;
compilerOptions.declaration = false;

// console.log('TS_CONFIG:' + JSON.stringify(tsconfig.compilerOptions));
// console.log('PATH IS: ' + npath.resolve('.'));

module.exports = {
    process(src, path) {
        if (path.endsWith('.ts') || path.endsWith('.tsx')) {
            let transpilerOptions =  {
                compilerOptions: compilerOptions,
                fileName: path
            };
            let transpileOutput = tsc.transpileModule(
                src,
                transpilerOptions
            );
            // console.log('Path '+ path +' compiled to: ' + transpileOutput.outputText);
            return transpileOutput.outputText;
        }
        return src;
    }
};