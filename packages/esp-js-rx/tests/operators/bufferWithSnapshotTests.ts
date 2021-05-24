import {of, Subject, Subscription} from 'rxjs';
import {bufferWithSnapshot, SnapshotOrUpdate} from '../../src/operators';

describe('bufferWithSnapshot', () => {
    let snapshotCallCount = 0;
    let mergeCallCount = 0;
    let completeCallCount = 0;
    let error = null;
    let received: SnapshotOrUpdate<number>[];
    let updates: Subject<number>;
    let snapshot: Subject<number[]>;
    let subscription: Subscription;

    beforeEach(() => {
        snapshotCallCount = 0;
        mergeCallCount = 0;
        completeCallCount = 0;
        error = null;
        received = [];
        snapshot = new Subject<number[]>();
        updates = new Subject<number>();
        subscription = updates
            .pipe(
                bufferWithSnapshot(
                    () => {
                        snapshotCallCount++;
                        return snapshot;
                    },
                    (buffer: number[], s: number[]) => {
                        mergeCallCount++;
                        return buffer.concat(s);
                    }
                )
            )
            .subscribe(
                (x: SnapshotOrUpdate<number>) => {
                    received.push(x);
                },
                err => {
                    error = err;
                },
                () => {
                    completeCallCount++;
                }
            );
    });

    it('only first snapshot item is taken', () => {
        updates.next(1);
        snapshot.next([2]);
        snapshot.next([3]); // should be ignored
        expect(snapshotCallCount).toEqual(1);
        expect(received.length).toEqual(1);
        expectSnapshot(received[0], [1, 2]);
    });

    it('procured items correctly shaped as update or snapshot', () => {
        updates.next(1);
        updates.next(2);
        updates.next(3);
        snapshot.next([4, 5, 6]);
        updates.next(7);
        updates.next(8);
        expect(received.length).toEqual(3);
        expectSnapshot(received[0], [1, 2, 3, 4, 5, 6]);
        expectUpdate(received[1], 7);
        expectUpdate(received[2], 8);
    });

    it('error on snapshot stream procured', () => {
        let e = new Error(`Boom`);
        updates.next(1); // trigger the snapshot factory
        snapshot.error(e);
        expect(error).toBe(e);
    });

    it('snapshot stream completes if snapshot not procured', () => {
        updates.next(1);
        snapshot.complete();
        expect(completeCallCount).toEqual(1);
    });

    it('snapshot stream completion does not complete after snapshot processed', () => {
        updates.next(1);
        snapshot.next([2]);
        snapshot.complete();
        expect(completeCallCount).toEqual(0);
    });

    const expectSnapshot = (su: SnapshotOrUpdate<number>, expected: number[]) => {
        expect(su.snapshot).toEqual(expected);
        expect(su.isSnapshot).toBeTruthy();
    };

    const expectUpdate = (su: SnapshotOrUpdate<number>, expected: number) => {
        expect(su.snapshot).toBeUndefined();
        expect(su.update).toEqual(expected);
        expect(su.isSnapshot).toBeFalsy();
    };
});