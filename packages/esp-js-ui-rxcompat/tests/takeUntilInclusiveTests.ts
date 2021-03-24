import {Subject} from 'rxjs-compat';

// need to import the library for side effects
import '../src';

describe('takeUntilInclusiveTests', () => {
    it('takeUntilInclusive includes last item', () => {
        let receivedItems = [];
        const subject = new Subject<number>();
        const xs = subject
            .takeUntilInclusive(item => item === 3).subscribe(
            i => {
                receivedItems.push(i);
            }
        );
        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.next(4);
        expect(receivedItems).toEqual([1,2,3]);
    });
});