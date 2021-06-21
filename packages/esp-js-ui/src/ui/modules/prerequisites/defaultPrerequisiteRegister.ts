import {Observable, EMPTY, ReplaySubject, Subscriber, concat} from 'rxjs';
import {ignoreElements, multicast, take} from 'rxjs/operators';
import {DisposableBase, Logger} from 'esp-js';
import {PrerequisiteRegister} from './prerequisiteRegister';
import {LoadResult, ResultStage} from './loadResult';
import {Unit} from '../../../core';
import {takeUntilInclusive, lazyConnect} from 'esp-js-rx';

const _log: Logger = Logger.create('PrerequisiteRegister');

export class DefaultPrerequisiteRegister extends DisposableBase implements PrerequisiteRegister  {
    private _stream: Observable<LoadResult> = EMPTY;
    private readonly _publishedStream: Observable<LoadResult>;

    constructor() {
        super();
        this._publishedStream =  new Observable(subscriber => {
            // We close over _stream so that we allow the class to modify
            // it (see registerStream function)
            return this._stream.subscribe(subscriber);
        }).pipe(
            // When we load, stop on the first error result we get
            // But yield it back to the consumer so they know it stopped
            takeUntilInclusive((result: LoadResult) =>  result.stage === ResultStage.Error),
            multicast(new ReplaySubject<LoadResult>(1)),
            lazyConnect(sub => this.addDisposable(sub))
        );
    }

    public registerAction(action: () => void, name: string, errorMessage?: (e: Error) => string): void {
        let stream = new Observable((obs: Subscriber<Unit>) => {
            action();
            obs.next(Unit.default);
            obs.complete();
        });
        this.registerStream(stream, name, errorMessage);
    }

    public load(): Observable<LoadResult> {
        // We have to assume that if someone calls load,
        // all streams /actions have been registered.
        return this._publishedStream;
    }

    public registerStreamFactory(factory: () => Observable<Unit>, name: string): void {
        let deferred = new Observable(sub => {
            let upstream = factory();
            return upstream.subscribe(sub);
        });
        return this.registerStream(deferred, name);
    }

    public registerStream(stream: Observable<Unit>, name: string, errorMessage?: (e: Error) => string): void {
        let builtStream = this._buildStream(stream, name, errorMessage);
        this._stream = concat<LoadResult>(this._stream, builtStream);
    }

    private _buildStream(stream: Observable<Unit>, name: string, errorMessage: (e: Error) => string = e => e.message) : Observable<LoadResult> {
        return new Observable<LoadResult>((obs: Subscriber<Unit>) => {
            obs.next({
                stage: ResultStage.Starting,
                name
            });

            let handleError = (e: Error) => {
                let message = `Error in async load for ${name}`;
                _log.error(message, e);
                obs.next({
                    stage: ResultStage.Error,
                    name,
                    errorMessage: errorMessage(e)
                });
                obs.complete();
            };
            return stream
                .pipe(
                    take(1),
                    ignoreElements(),
                )
                .subscribe(
                    _ => {
                    },
                    e => handleError(e),
                    () => {
                        obs.next({
                            stage: ResultStage.Completed,
                            name
                        });
                        obs.complete();
                    }
                );
        });
    }
}