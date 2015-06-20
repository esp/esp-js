import EventContext from '../../src/router/EventContext';

describe('EventContext', () => {
    var ec;

    beforeEach(function(){
        ec = new EventContext('modekId', 'eventType', "event1Data");
    });

    it('throws if canceled twice', () => {
        ec.cancel();
        expect(function() { ec.cancel(); }).toThrow();
    });

    it('throws if committed twice', () => {
        ec.commit();
        expect(function() { ec.commit(); }).toThrow();
    });

    it('should set isCommitted on commit', function() {
        ec.commit();
        expect(ec.isCommitted).toEqual(true);
    });

    it('should set isCancelled on commit', function() {
        ec.cancel();
        expect(ec.isCanceled).toEqual(true);
    });
});