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

const fs = require('fs');
const babelConfig = JSON.parse(fs.readFileSync('.babelrc', "utf8"));
const babelJest = require('babel-jest');
// override our .bablerc to have inline source maps, this helps with debugging (line numbers work as expected) in intellij/webstorm.
const newConfig = Object.assign(babelConfig, {sourceMaps:"inline"});
module.exports = babelJest.createTransformer(newConfig);
