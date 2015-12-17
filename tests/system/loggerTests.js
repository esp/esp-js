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

import * as Logger from '../../src/system/logger';

describe('Logger', () => {
    var _lastLevel;
    var _lasMessage;
    var _lastLoggerName;
    var _log;

    beforeEach(() =>{
        _lastLevel = undefined;
        _lasMessage = undefined;
        _lastLoggerName = undefined;
        Logger.setSink(logEvent => {
            _lastLevel = logEvent.level;
            _lasMessage = logEvent.message;
            _lastLoggerName = logEvent.logger;
        });
        _log = Logger.create("TestLogger");
        Logger.setLevel(Logger.levels.verbose);
    });

    it('should log out the level and message', () => {
        _log.verbose("1");
        expect(_lasMessage).toEqual("1");
        expect(_lastLevel).toEqual("VERBOSE");
        expect(_lastLoggerName).toEqual("TestLogger");

        _log.debug("2");
        expect(_lasMessage).toEqual("2");
        expect(_lastLevel).toEqual("DEBUG");
        expect(_lastLoggerName).toEqual("TestLogger");

        _log.info("3");
        expect(_lasMessage).toEqual("3");
        expect(_lastLevel).toEqual("INFO");
        expect(_lastLoggerName).toEqual("TestLogger");

        _log.warn("4");
        expect(_lasMessage).toEqual("4");
        expect(_lastLevel).toEqual("WARN");
        expect(_lastLoggerName).toEqual("TestLogger");

        _log.error("5");
        expect(_lasMessage).toEqual("5");
        expect(_lastLevel).toEqual("ERROR");
        expect(_lastLoggerName).toEqual("TestLogger");
    });

    it('should format the given log string with the arguments', () => {
        _log.error("My format [{0} {1} {2}]", "keith", "wrote", "code");
        expect(_lasMessage).toEqual("My format [keith wrote code]");
    });
});