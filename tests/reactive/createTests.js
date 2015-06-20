import * as reactive from '../../src/reactive/index';

describe('.create', () => {
    var subject;

    beforeEach(() => {
        subject = new reactive.Subject();
    });

    it('.create invokes the subscription factory on observable subscription', () => {
        var mer = {};
        var subject = new reactive.Subject();
        var stream  = reactive.Observable.create(o => {
            return subject.observe(o);
        }, mer);
        var received = [];
        stream.observe(i => {
            received.push(i);
        });
        subject.onNext(1);
        expect(received.length).toEqual(1);
        expect(received[0]).toEqual(1);
    });
});