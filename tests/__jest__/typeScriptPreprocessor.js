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

module.exports = {
    process(src, path) {
        if (path.endsWith('.ts') || path.endsWith('.tsx')) {
            let options = path.includes('ES5') // bit of a hack
                ? Object.assign(compilerOptions, { target: "es5" })
                : compilerOptions
            let compiled = tsc.transpile(
                src,
                options,
                path,
                []
            );
            //console.log('Path '+ path +' compiled to: ' + compiled);
            return compiled;
        }
        return src;
    },
};