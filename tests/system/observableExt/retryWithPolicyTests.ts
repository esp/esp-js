import * as Rx from 'rx';

import {RetryPolicy} from '../../../src/core/observableExt';

describe('.retryWithPolicy()', () => {
    var _subject:Rx.Subject<any>,
        _stream,
        _testScheduler:Rx.HistoricalScheduler,
        _relievedValue,
        _throwIf,
        _policy,
        _onRetryErr,
        _err,
        _disposable;

    beforeEach(() => {
        _subject = new Rx.Subject<any>();
        _testScheduler = new Rx.HistoricalScheduler(0, null);
        _relievedValue = 0;
        _throwIf = -1;
        _policy = new RetryPolicy("TestOperation", 2, 1000, "An Error");
        _stream = Rx.Observable.create<any>(o => {
            _subject.subscribe(
                i => {
                    if(i ===  _throwIf) {
                        o.onError(new Error("Boom!"));
                    } else {
                        o.onNext(i);
                    }
                }
            );
        });

    });

    function subscribe() {
        _disposable = _stream
            .retryWithPolicy(
                _policy, err => {
                    _onRetryErr = err;
                },
                _testScheduler
            )
            .subscribe(
                i => _relievedValue = i,
                err => _err = err
        );
    }

    it('propagates values through the stream', () =>{
        subscribe();
        _subject.onNext(1);
        expect(_relievedValue).toEqual(1);
    });

    it('retries after exception', () =>{
        subscribe();
        _subject.onNext(1);
        expect(_relievedValue).toEqual(1);
        _subject.onNext(-1);
        expect(_policy.retryCount).toEqual(1);
        _testScheduler.advanceBy(1001);
        _subject.onNext(2);
        expect(_relievedValue).toEqual(2);
    });

    it('calls onError on exception', () =>{
        subscribe();
        _subject.onNext(-1);
        expect(_onRetryErr).toEqual(new Error("Boom!"));
    });


    it('resets retry count after successful propagation', () =>{
        subscribe();
        _subject.onNext(-1);
        expect(_policy.retryCount).toEqual(1);
        _testScheduler.advanceBy(1001);
        _subject.onNext(1);
        expect(_policy.retryCount).toEqual(0);
    });

    it('propagates the exception after retry count limit reached', () =>{
        subscribe();
        _subject.onNext(-1);
        _testScheduler.advanceBy(1001);
        _subject.onNext(-1);
        expect(_err).toBeDefined();
    });

    it('should dispose internal subscription after stream disposed', () => {
        _disposable.dispose();
        _subject.onNext(-1);
        expect(_policy.retryCount).toEqual(0);
    });

    it('should not resubscribe if retryafter callback happens after disposal occurred', () => {
        subscribe();
        _subject.onNext(-1);
        _disposable.dispose();
        _testScheduler.advanceBy(1001);
        expect(_policy.retryCount).toEqual(1);
    });

    it('should not retry with the none retry policy', () => {
        _policy = RetryPolicy.none();
        subscribe();
        _subject.onNext(-1);
        expect(_err).toBeDefined();
    });

    it('should retry unlimited when retry count is below 0', () => {
        var doError = () => {
            _subject.onNext(-1);
            _testScheduler.advanceBy(1001);
        };
        _policy = RetryPolicy.createForUnlimitedRetry("ATest", 1000);
        subscribe();
        doError();
        doError();
        doError();
        expect(_policy.retryCount).toEqual(3);
        _subject.onNext(1);
        expect(_relievedValue).toEqual(1);
    });
});
