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
const tsconfig = require('../../tsconfig.json');

let compilerOptions = tsconfig.compilerOptions;
// source maps don't work well on the latest of node/tsc/jest/idea, it's a
// game of pick the settings that work across everything, even then it doesn't really work at times
// It seems the idea needs the following re-configured so it picks up source maps
compilerOptions.rootDir = undefined;
compilerOptions.outDir = undefined;
compilerOptions.sourceMap = undefined;
compilerOptions.inlineSourceMap = true;

module.exports = {
    process(src, path) {
        if (path.endsWith('.ts') || path.endsWith('.tsx')) {
            let compiled = tsc.transpile(
                src,
                compilerOptions,
                path,
                []
            );
            // console.log('CONFIG:' + JSON.stringify(tsconfig.compilerOptions));
            // console.log('Path '+ path +', with options ['+ JSON.stringify(tsconfig.compilerOptions) +'], compiled to: ' + compiled);
            return compiled;
        }
        return src;
    },
};