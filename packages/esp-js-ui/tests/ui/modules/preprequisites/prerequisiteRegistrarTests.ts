import * as Rx from 'rxjs';
import '../../../../src/core/observableExt';
import {DefaultPrerequisiteRegister} from '../../../../src/ui/modules/prerequisites';
import {Unit} from '../../../../src/core';
import {LoadResult, ResultStage} from '../../../../src/ui/modules/prerequisites';

describe('Default Prerequisite Registrar Tests', () => {
    let register: DefaultPrerequisiteRegister;
    
    beforeEach(() => {
        register = new DefaultPrerequisiteRegister();
    });
    
    describe('Error Tests', () => {
        it('Should yield back an error result and not onError', () => {
           let stream = new Rx.Subject();
           register.registerStream(stream, 'Cohagen');

           let actualResult;
           let onNextCount = 0;
           let errorCount = 0;
           let onCompletedCount = 0;

           register.load()
               .subscribe(result => {
                   actualResult = result;
                   onNextCount++;
               },
               e => {
                   errorCount++;
               },
               () => {
                    onCompletedCount++;
               });

           stream.error(new Error('Spanner in the works'));

           expect(errorCount).toEqual(0);
           expect(onCompletedCount).toEqual(1);
           expect(onNextCount).toEqual(2);
           expect(actualResult.stage).toEqual(ResultStage.Error);
        });

        it('Should not run subsequent streams after an error', () => {
            let stream = new Rx.Subject();
            register.registerStream(stream, 'Cohagen');

            let subscribed = false;
            let nonStartedStream = Rx.Observable.defer(() => {
                subscribed = true;
                return Rx.Observable.of(Unit.default);
            });
            register.registerStream(nonStartedStream, 'Barry');

            let actualResult;
            let onNextCount = 0;
            let onCompletedCount = 0;

            register.load()
                .subscribe(result => {
                        actualResult = result;
                        onNextCount++;
                    },
                    e => {},
                    () => {
                        onCompletedCount++;
                    });

            stream.error(new Error('Spanner in the works'));
            expect(onCompletedCount).toEqual(1);
            expect(onNextCount).toEqual(2);
            expect(actualResult.stage).toEqual(ResultStage.Error);
            expect(actualResult.name).toEqual('Cohagen');
            expect(subscribed).toEqual(false);
        });
    });
    
    describe('Actions are handled tests', () => {
        it('Should treat an action like a stream', () => {
            let called = false;
            let action = () => {
                called = true;
            };

            register.registerAction(action, 'Cohagen');
            let actualResult;
            let onNextCount = 0;
            let errorCount = 0;
            let onCompletedCount = 0;

            register.load()
                .subscribe(result => {
                        actualResult = result;
                        onNextCount++;
                    },
                    e => errorCount++,
                    () => onCompletedCount++);

            expect(errorCount).toEqual(0);
            expect(onCompletedCount).toEqual(1);
            expect(onNextCount).toEqual(2);
            expect(actualResult.stage).toEqual(ResultStage.Completed);
            expect(actualResult.name).toEqual('Cohagen');
            expect(called).toEqual(true);
        });

        it('Should treat a throw like a normal stream error', () => {
            let called = false;
            let action = () => {
                called = true;
                throw new Error('Spanner in the works');
            };

            register.registerAction(action, 'Cohagen');
            let actualResult;
            let onNextCount = 0;
            let errorCount = 0;
            let onCompletedCount = 0;

            register.load()
                .subscribe(result => {
                        actualResult = result;
                        onNextCount++;
                    },
                    e => errorCount++,
                    () => onCompletedCount++);

            expect(errorCount).toEqual(0);
            expect(onCompletedCount).toEqual(1);
            expect(onNextCount).toEqual(2);
            expect(actualResult.stage).toEqual(ResultStage.Error);
            expect(actualResult.name).toEqual('Cohagen');
            expect(called).toEqual(true);
        });
    });
    
    describe('Streams tests', () => {
        it('Should yield back completed for a stream', () => {
            let stream = new Rx.Subject();
            register.registerStream(stream, 'Cohagen');

            let completed = false;
            let results: Array<LoadResult> = [];
            register.load()
                .subscribe(
                    result => results.push(result),
                    e => {},
                    () => completed = true
                );

            stream.next(1);

            expect(results.length).toEqual(2);
            expect(results[0].stage).toEqual(ResultStage.Starting);
            expect(results[1].stage).toEqual(ResultStage.Completed);
            expect(completed).toEqual(true);
        });

        it('Should only complete after all prereqs finish successfully', () => {
            let stream1 = new Rx.Subject();
            let stream2 = new Rx.Subject();
            register.registerStream(stream1, 'stream1');
            register.registerStream(stream2, 'stream2');

            let completed = false;
            let results: Array<LoadResult> = [];
            register.load()
                .subscribe(
                    result => results.push(result),
                    e => {},
                    () => completed = true
                );

            stream1.next(1);

            expect(results.length).toEqual(3);
            expect(results[0].stage).toEqual(ResultStage.Starting);
            expect(results[0].name).toEqual('stream1');
            expect(results[1].stage).toEqual(ResultStage.Completed);
            expect(results[1].name).toEqual('stream1');
            expect(results[2].stage).toEqual(ResultStage.Starting);
            expect(results[2].name).toEqual('stream2');

            expect(completed).toEqual(false);

            stream2.next(2);
            expect(results.length).toEqual(4);
            expect(results[3].stage).toEqual(ResultStage.Completed);
            expect(results[3].name).toEqual('stream2');
            expect(completed).toEqual(true);
        });

        it('Should run all prereqs in the order that they were registered and subscribe once the previous has completed', () => {
            let stream1 = new Rx.Subject();
            let stream2 = new Rx.Subject();

            let counter = 0;
            let stream1Counter = 0;
            let stream2Counter = 0;

            register.registerStream(stream1.doOnSubscribe(() => stream1Counter = ++counter), 'stream1');
            register.registerStream(stream2.doOnSubscribe(() => stream2Counter = ++counter), 'stream2');

            register.load()
                .subscribe();

            expect(stream1Counter).toEqual(1);
            expect(stream2Counter).toEqual(0);

            stream1.next({});
            expect(stream2Counter).toEqual(2);
        });

        it('Should handle a case where a stream does not yield and just completes', () => {
            let stream = new Rx.Subject();

            let counter = 0;
            register.registerStream(stream, 'stream1');

            register.load()
                .subscribe(() => {}, () => {}, () => {
                    counter++;
                });

            expect(counter).toEqual(0);
            stream.complete();
            expect(counter).toEqual(1);
        });
    });
});