import * as reactive from '../../src/reactive/index';
 
describe('.where', () => {
    var subject;

    beforeEach(() => {
        subject = new reactive.Subject();
    });

    it('should pass yielded item to observer', () => {
        var receivedItems = [];
        subject
            .where(i => {
                receivedItems.push(i);
                return true; })
            .observe(i => { });

        subject.onNext(1);
        expect(receivedItems.length).toBe(1);
        expect(receivedItems[0]).toBe(1);
    });

    it('should propagate items based on the predicate result', () => {
        var receivedItems = [];
        subject
            .where(i => {
                return i > 5; })
            .observe(i => { receivedItems.push(i); });

        subject.onNext(1);
        expect(receivedItems.length).toBe(0);
        subject.onNext(6);
        expect(receivedItems.length).toBe(1);
        expect(receivedItems[0]).toBe(6);
    });

    it('doesn\'t propagate to disposed streams', () => {
        var receivedItems = 0;
        var disposable = subject
            .where(i => {
                return true; })
            .observe(i => { receivedItems++; });

        subject.onNext('a');
        subject.onNext('b');
        expect(receivedItems).toBe(2);
        disposable.dispose();
        subject.onNext('c');
        expect(receivedItems).toBe(2);
    });

    it('should propagate errors', () => {
        var error;
        var disposable = subject
            .where(i => {
                throw 'Boom'; })
            .observe(
                i => { },
                ex =>{ error = ex;});

        subject.onNext('a');
        expect(error).toBe('Boom');
    });

    it('should propagat onCompleted', () => {
        var onCompleteCalled = false;
        subject
            .where(i => i > 0)
            .observe(
                () => { },
                () =>{ },
                () => onCompleteCalled = true
            );

        subject.onNext(1);
        subject.onCompleted();
        expect(onCompleteCalled).toEqual(true);
    });
});