import {Subject, Subscription} from 'rxjs';
import {Router} from 'esp-js';
import {subscribeOnEspDispatchLoop} from '../../src/operators';

describe('ESP Observable subscribeOnEspDispatchLoop Tests', () => {
    let _model: {};
    let _receivedItems: {item: number, isOnDispatchLoop: boolean}[];
    let _receivedErrors: any[];
    let _router: Router;
    let _subject: Subject<number>;
    let _completeCount: number;
    let _subscription: Subscription;

    beforeEach(() => {
        _model = {};
        _router = new Router();
        _router.addModel('model-id', _model);
        _receivedItems = [];
        _receivedErrors = [];
        _subject = new Subject();
        _completeCount = 0;
        let stream = _subject.pipe(
            subscribeOnEspDispatchLoop(_router, 'model-id')
        );
        _subscription = stream.subscribe(
            (i: number) => {
                _receivedItems.push({
                    item: i,
                    isOnDispatchLoop: _router.isOnDispatchLoopFor('model-id')
                });
            },
            error => {
                _receivedErrors.push(error);
            },
            () => {
                _completeCount++;
            }
        );
    });

    it('items procured on router dispatch loop', () => {
        _subject.next(1);
        _subject.next(2);
        expect(_receivedItems.length).toEqual(2);
    });

    it('model instanced passed', () => {
        _subject.next(1);
        expect(_receivedItems[0].item).toBe(1);
    });

    // noinspection DuplicatedCode
    it('is called on models dispatch loop', () => {
        _subject.next(1);
        expect(_receivedItems[0].isOnDispatchLoop).toBeTruthy();
    });

    it('error handler propagated', () => {
        let error = new Error('Boom');
        _subject.error(error);
        expect(_receivedErrors.length).toEqual(1);
        expect(_receivedErrors[0]).toBe(error);
    });

    it('complete handler propagated', () => {
        _subject.complete();
        _subject.complete();
        expect(_completeCount).toEqual(1);
    });
});