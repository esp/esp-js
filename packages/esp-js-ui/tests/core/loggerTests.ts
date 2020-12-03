import {Level, LogEvent, Logger, LoggingConfig} from '../../src/core';

describe('Logger', () => {
    let _logger: Logger,
        _logEvent: LogEvent;

    beforeEach(() => {
        _logger = undefined;
        _logEvent = undefined;
        LoggingConfig.addSinks({
            log(e: LogEvent) {
                _logEvent = e;
            }
        });
        _logger = Logger.create('testLogger');
    });

    describe('log', () => {
        it('sets LogEvent.message', () => {
            _logger.debug('foo');
            assertLogEvent({}, ['foo'], null);
        });

        it('sets LogEvent.markers', () => {
            _logger.debug({foo: 'bar'}, 'foo');
            assertLogEvent({foo: 'bar'}, ['foo'], null);
        });

        it('sets LogEvent.message', () => {
            _logger.debug({foo: 'bar'}, 'foo', {a: 'check1'});
            assertLogEvent({foo: 'bar'}, ['foo', {a: 'check1'}], null);
        });

        it('log.error sets LogEvent.error', () => {
            _logger.error({foo: 'bar'}, 'foo');
            assertLogEvent({foo: 'bar'}, ['foo'], null);
        });

        it('log.error sets LogEvent.error', () => {
            _logger.error({foo: 'bar'}, 'foo', {a: 'check1'});
            assertLogEvent({foo: 'bar'}, ['foo'], {a: 'check1'});
        });

        it('should take level at construction time', () => {
            _logger = Logger.create('testLogger1', {level: Level.info});
            _logger.debug('Its dead jim');
            expect(_logEvent).not.toBeDefined();
            _logger.info('Its dead jim');
            expect(_logEvent).toBeDefined();
        });

        it('should take additional details at construction time', () => {
            _logger = Logger.create('testLogger2', {dumpAdditionalDetailsToConsole: false});
            _logger.debug('Its dead jim', {'other': ''});
            expect(_logEvent).toBeDefined();
            expect(LoggingConfig.getLoggerConfig('testLogger2').dumpAdditionalDetailsToConsole).toEqual(false);
        });

        it('can set level for all loggers tht haven\'t overrode', () => {
            const l1 = Logger.create('l1', {level: Level.error}); // override
            const l2 = Logger.create('l2');
            const l3 = Logger.create('l3');
            const l1Config = LoggingConfig.getLoggerConfig('l1');
            const l2Config = LoggingConfig.getLoggerConfig('l2');
            const l3Config = LoggingConfig.getLoggerConfig('l3');
            expect(l1Config.level).toEqual(Level.error);
            expect(l2Config.level).toEqual(Level.debug); // default
            expect(l3Config.level).toEqual(Level.debug); // default
            LoggingConfig.setLevel(Level.none);
            expect(l1Config.level).toEqual(Level.error);
            expect(l2Config.level).toEqual(Level.none);
            expect(l3Config.level).toEqual(Level.none);
        });

        function assertLogEvent(expectedMarkers: any, expectedMessage: any, expectedError: any) {
            expect(_logEvent.markers).toEqual(expectedMarkers);
            expect(_logEvent.message).toEqual(expectedMessage);
            expect(_logEvent.error).toEqual(expectedError);
        }
    });
});
