import { default as Logger, LoggingConfig, LogEvent } from '../../src/core/logger';
describe('Logger', () => {
    let _logger:Logger,
        _logEvent:LogEvent;

    beforeEach(() => {
        LoggingConfig.addSinks({ log(e:LogEvent) {
            _logEvent = e;
        }});
        _logger = Logger.create('testLogger');
    });

    describe('log', () => {
        it('sets LogEvent.message', () => {
            _logger.debug('foo');
            assertLogEvent({}, 'foo', []);
        });

        it('sets LogEvent.markers', () => {
            _logger.debug({foo:'bar'}, 'foo');
            assertLogEvent({foo:'bar'}, 'foo', []);
        });

        it('sets LogEvent.additionalDetails', () => {
            _logger.debug({foo:'bar'}, 'foo', {a:'check1'}, {b:'check2'});
            assertLogEvent({foo:'bar'}, 'foo', [{a:'check1'}, {b:'check2'}]);
        });

        function assertLogEvent(expectedMarkers:any, expectedMessage:any, expectedAdditionalDetails:any) {
            expect(_logEvent.markers).toEqual(expectedMarkers);
            expect(_logEvent.message).toEqual(expectedMessage);
            expect(_logEvent.additionalDetails).toEqual(expectedAdditionalDetails);
        }
    });
});
