import {Subject} from 'rxjs';
import {takeUntilInclusive} from '../../../src/core/observableExt/takeUntilInclusive';

describe('takeUntilInclusiveTests', () => {
    it('takeUntilInclusive includes last item', () => {
        let receivedItems = [];
        const subject = new Subject<number>();
        const xs = subject.pipe(
            takeUntilInclusive(item => item === 3)
        );
        xs.subscribe(
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