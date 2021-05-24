import {Observable, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

export interface SnapshotOrUpdate<TStreamItem> {
    snapshot?: TStreamItem[];
    update?: TStreamItem;
    isSnapshot: boolean;
}

/**
 * Subscribes to the upstream source, on first message calls a snapshotFactory to get the snapshot.
 * This variant won't call the snapshotFactory until the first message as that is often needed to figure out what part of the shapshot is required.
 *
 * When the snapshot is returned, onMergeSnapshot will be called passing a list of any pending updates, it's result yielded downstream as an array.
 * The stream will tick each follow on update passing a SnapshotOrUpdate<TStreamItem>.
 *
 * @param snapshotFactory: returns an observable that yields once with the snapshot
 * @param onMergeSnapshot: merges the buffer (new items at the start) with the snapshot, the oldest item should be at index 0. Any custom merge logic should be done here.
 */
export function bufferWithSnapshot<TStreamItem>(
    snapshotFactory: (firstMessage: TStreamItem) => Observable<TStreamItem[]>,
    onMergeSnapshot: (buffer:TStreamItem[], snapshot: TStreamItem[]) => TStreamItem[]
) : (source: Observable<TStreamItem>) => Observable<SnapshotOrUpdate<TStreamItem>> {
    return (source: Observable<TStreamItem>) => new Observable<SnapshotOrUpdate<TStreamItem>>((subscriber) => {
        const subscription = new Subscription();
        let isFirstMessage = true;
        let shouldBuffer = true;
        let buffer: TStreamItem[] = [];
        const subscribeToSnapshot = (firstMessage: TStreamItem) => {
            const snapshotStream = snapshotFactory(firstMessage);
            subscription.add(
                snapshotStream.pipe(take(1)).subscribe(
                    (snapshot: TStreamItem[]) => {
                        let bufferCopy = buffer.slice();
                        buffer.length = 0;
                        let stateOfTheWorld = onMergeSnapshot(bufferCopy, snapshot);
                        shouldBuffer = false;
                        subscriber.next({
                            snapshot: stateOfTheWorld,
                            isSnapshot: true
                        });
                    },
                    error => subscriber.error(error),
                    () => {
                        // if we've not received the snapshot and the stream completes, we push that complete up stream
                        if (shouldBuffer) {
                            subscriber.complete();
                        }
                    }
                )
            );
        };
        subscription.add(
            source
                .subscribe(
                    (dto: TStreamItem) => {
                        if (shouldBuffer) {
                            buffer.push(dto);
                            if (isFirstMessage) {
                                isFirstMessage = false;
                                subscribeToSnapshot(dto);
                            }
                        } else {
                            subscriber.next({
                                update: dto,
                                isSnapshot: false
                            });
                        }
                    },
                    error => {
                        subscriber.error(error);
                    },
                    () => subscriber.unsubscribe()
                )
        );
        return () => {
            subscription.unsubscribe();
        };
    });
}