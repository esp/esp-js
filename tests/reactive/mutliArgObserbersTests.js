import * as reactive from '../../src/reactive/index';

describe('multi argument observers', () => {
    var subject;

    beforeEach(() => {
        subject = new reactive.Subject();
    });

    it('should take a multi argument observe on a subject ', () => {

        var a1, b1;
        subject.observe((a, b) => {
            a1 = a;
            b1 = b;
        });
        subject.onNext(1, 2);
        expect(a1).toEqual(1);
        expect(b1).toEqual(2);
    });

    it('should take a multi argument observer with where', () => {
        var a1, b1;
        subject
            .where((a, b) => {
                return a + b === 8;
            })
            .observe((a, b) => {
            a1 = a;
            b1 = b;
        });
        subject.onNext(4, 4);
        expect(a1).toEqual(4);
        expect(b1).toEqual(4);
    });
});