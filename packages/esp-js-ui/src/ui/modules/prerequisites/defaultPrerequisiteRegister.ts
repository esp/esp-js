import * as Rx from 'rxjs';
import {DisposableBase} from 'esp-js';
import {PrerequisiteRegister} from './prerequisiteRegister';
import {LoadResult, ResultStage} from './loadResult';
import {Logger, Unit} from '../../../core';

const _log: Logger = Logger.create('PrerequisiteRegister');

export class DefaultPrerequisiteRegister extends DisposableBase implements PrerequisiteRegister  {
    private _stream: Rx.Observable<LoadResult> = Rx.Observable.empty<LoadResult>();
    private readonly _publishedStream: Rx.Observable<LoadResult>;

    constructor() {
        super();

        this._stream = Rx.Observable.empty<LoadResult>();
        this._publishedStream = Rx.Observable
            .defer<LoadResult>(() => {
                // We close over _stream so that we allow the class to modify
                // it (see registerStream function)
                return this._stream;
            })
            // When we load, stop on the first error result we get
            // But yield it back to the consumer so they know it stopped
            .takeUntilInclusive((result: LoadResult) =>  result.stage === ResultStage.Error)
            .multicast(new Rx.ReplaySubject<LoadResult>(1))
            .lazyConnect<LoadResult>(sub => this.addDisposable(sub));
    }

    public registerAction(action: () => void, name: string, errorMessage?: (e: Error) => string): void {
        let stream = Rx.Observable.create((obs: Rx.Subscriber<Unit>) => {
            action();
            obs.next(Unit.default);
            obs.complete();
        });
        this.registerStream(stream, name, errorMessage);
    }

    public load(): Rx.Observable<LoadResult> {
        // We have to assume that if someone calls load,
        // all streams /actions have been registered.
        return this._publishedStream;
    }

    public registerStreamFactory(factory: () => Rx.Observable<Unit>, name: string): void {
        return this.registerStream(Rx.Observable.defer(() => factory()), name);
    }

    public registerStream(stream: Rx.Observable<Unit>, name: string, errorMessage?: (e: Error) => string): void {
        let builtStream = this._buildStream(stream, name, errorMessage);
        this._stream = this._stream.concat(builtStream);
    }

    private _buildStream(stream: Rx.Observable<Unit>, name: string, errorMessage: (e: Error) => string = e => e.message) : Rx.Observable<LoadResult> {
        return Rx.Observable.create((obs: Rx.Subscriber<Unit>) => {
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
                .take(1)
                .ignoreElements()
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