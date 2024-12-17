import {createImmutableModelUtility, ImmutableModelUtility} from '../src/immutableModelUtility';
import {StrictModeSettings, StrictMode} from '../src';

// This is only a shallow model,
// ImmutableModelUtility only deals with the top level reference, not nested props
type TestState = {
    sumModelProps(): any;
    i2: number;
    i1: number;
};

describe('ImmutableModelUtility tests', () => {
    let initialState: TestState;
    let modelMutator: ImmutableModelUtility<TestState>;
    let expectedError = 'esp-js-polimer immutable model (id model-id1} accessed after change. You are likely closing over an old version of the model. This will cause issues as the model\'s state has since.';

    const createTestModel = (i1: number, i2: number) => {
        const model: TestState = {
            i1,
            i2,
            sumModelProps() {
                return this.i1 + this.i2;
            }
        };
        return model;
    };

    afterEach(() => {
        StrictModeSettings.setStrictMode('Off');
    });

    describe('StrictModeSettings.setStrictMode(Off)', () => {
        beforeEach(() => {
            StrictModeSettings.setStrictMode('Off');
            initialState = createTestModel(1, 2);
            modelMutator = createImmutableModelUtility('model-id1', initialState);
        });

        it('immutableModel is not proxied', () => {
            expect(modelMutator.immutableModel).toBe(initialState);
        });

        it('immutableModel is frozen', () => {
            let anyModel = <any>modelMutator.immutableModel;
            expect(() => {
                anyModel.foo = 'foo-here';
            }).toThrow("Cannot add property foo, object is not extensible");
        })

        it('draft is null', () => {
            expect(modelMutator.draftModel).toBeNull();
        });

        describe('Mutations', () => {
            let immutableModelBeforeExpiration: TestState;
            let immutableModelInstanceBeforeExpiration: TestState;

            beforeEach(() => {
                immutableModelBeforeExpiration = {...modelMutator.immutableModel};
                immutableModelInstanceBeforeExpiration = modelMutator.immutableModel;
                modelMutator.beginMutation();
            });

            it('props copied to draft', () => {
                expect(modelMutator.draftModel).toEqual(immutableModelBeforeExpiration);
            });

            it('old immutableModel still works, does not throw', () => {
                expect(() => {
                    immutableModelInstanceBeforeExpiration.sumModelProps();
                }).not.toThrow();
                expect(() => {
                    immutableModelInstanceBeforeExpiration.i1.toString();
                }).not.toThrow();
            });

            it('draft can be updated', () => {
                modelMutator.draftModel.i1 = 10;
                modelMutator.draftModel.i2 = 10;
                expect(modelMutator.draftModel.sumModelProps()).toEqual(20);
            });

            it('changes to draft are tracked', () => {
                expect(modelMutator.draftHasChanges).toEqual(false);
                modelMutator.draftModel.i1 = 10;
                expect(modelMutator.draftHasChanges).toEqual(true);
            });

            it('deletes changes to draft are tracked', () => {
                expect(modelMutator.draftHasChanges).toEqual(false);
                delete modelMutator.draftModel.i1;
                expect(modelMutator.draftHasChanges).toEqual(true);
            });

            describe('endMutation()', () => {
                let draftBeforeEndMutation: TestState;

                beforeEach(() => {
                    modelMutator.draftModel.i1 = 10;
                    modelMutator.draftModel.i2 = 10;
                    draftBeforeEndMutation = {...modelMutator.draftModel};
                    modelMutator.endMutation();
                });

                it('props from draft to immutablemodel', () => {
                    expect(modelMutator.immutableModel).toEqual(draftBeforeEndMutation);
                });

                it('updates immutableModel', () => {
                    expect(modelMutator.immutableModel.sumModelProps()).toEqual(20);
                });

                it('nulls draft', () => {
                    expect(modelMutator.draftModel).toBeNull();
                });

                it('draft has changes is false', () => {
                    expect(modelMutator.draftHasChanges).toEqual(false);
                });
            });
        });
    });

    describe('StrictModeSettings.setStrictMode(ThrowError)', () => {
        beforeEach(() => {
            StrictModeSettings.setStrictMode('ThrowError');
            initialState = createTestModel(1, 2);
            modelMutator = createImmutableModelUtility('model-id1', initialState);
        });

        it('state is proxied', () => {
            expect(modelMutator.immutableModel).not.toBe(initialState);
        });

        it('props are accessible via proxy', () => {
            expect(modelMutator.immutableModel.i1).toEqual(1);
            expect(modelMutator.immutableModel.i2).toEqual(2);
        });

        it('functions are proxied', () => {
            expect(modelMutator.immutableModel.sumModelProps()).toEqual(3);
        });

        it('draft is null', () => {
            expect(modelMutator.draftModel).toBeNull();
        });

        describe('Mutations', () => {
            let immutableModelCopyBeforeExpiration: TestState;
            let immutableModelInstanceBeforeExpiration: TestState;

            beforeEach(() => {
                immutableModelCopyBeforeExpiration = {...modelMutator.immutableModel};
                immutableModelInstanceBeforeExpiration = modelMutator.immutableModel;
                modelMutator.beginMutation();
            });

            it('props copied to draft', () => {
                expect(modelMutator.draftModel).toEqual(immutableModelCopyBeforeExpiration);
            });

            it('immutableModel marked as expired after mutation ends and prop access throws error', () => {
                modelMutator.draftModel.i1 = 100;
                modelMutator.endMutation();

                expect(() => {
                    immutableModelInstanceBeforeExpiration.sumModelProps();
                }).toThrow(expectedError);

                expect(() => {
                    immutableModelInstanceBeforeExpiration.i1.toString();
                }).toThrow(expectedError);
            });

            it('immutableModel NOT marked as expired when there is no change', () => {
                modelMutator.endMutation();

                expect(() => {
                    immutableModelInstanceBeforeExpiration.sumModelProps();
                }).not.toThrow();

                expect(() => {
                    immutableModelInstanceBeforeExpiration.i1.toString();
                }).not.toThrow();
            });

            it('draft can be updated', () => {
                modelMutator.draftModel.i1 = 10;
                modelMutator.draftModel.i2 = 10;
                expect(modelMutator.draftModel.sumModelProps()).toEqual(20);
            });

            it('setter changes to draft are tracked', () => {
                expect(modelMutator.draftHasChanges).toEqual(false);
                modelMutator.draftModel.i1 = 10;
                expect(modelMutator.draftHasChanges).toEqual(true);
            });

            it('deletes changes to draft are tracked', () => {
                expect(modelMutator.draftHasChanges).toEqual(false);
                delete modelMutator.draftModel.i1;
                expect(modelMutator.draftHasChanges).toEqual(true);
            });

            describe('endMutation()', () => {
                let draftBeforeEndMutation: TestState;

                beforeEach(() => {
                    modelMutator.draftModel.i1 = 10;
                    modelMutator.draftModel.i2 = 10;
                    draftBeforeEndMutation = {...modelMutator.draftModel};
                    modelMutator.endMutation();
                });

                it('props from draft to immutablemodel', () => {
                    expect(modelMutator.immutableModel).toEqual(draftBeforeEndMutation);
                });

                it('updates immutableModel', () => {
                    expect(modelMutator.immutableModel.sumModelProps()).toEqual(20);
                });

                it('nulls draft', () => {
                    expect(modelMutator.draftModel).toBeNull();
                });

                it('draft has changes is false', () => {
                    expect(modelMutator.draftHasChanges).toEqual(false);
                });
            });
        });
    });

    describe('StrictModeSettings.setStrictMode(WarnOnly)', () => {
        beforeEach(() => {
            StrictModeSettings.setStrictMode('WarnOnly');
        });

        it('does not throw when old immutableModel accessed', () => {
            initialState = createTestModel(1, 2);
            modelMutator = createImmutableModelUtility('model-id1', initialState);
            let oldModel = modelMutator.immutableModel;
            modelMutator.beginMutation();
            modelMutator.draftModel.i1 = 30;
            modelMutator.draftModel.i2 = 20;
            modelMutator.endMutation();
            expect(oldModel.sumModelProps()).toEqual(3);
            expect(modelMutator.immutableModel.sumModelProps()).toEqual(50);
        });
    });


    describe('Nested Proxies', () => {
        beforeEach(() => {
        });

        it('throws if proxy passed to createImmutableModelUtility', () => {
            StrictModeSettings.setStrictMode('ThrowError');
            initialState = createTestModel(1, 2);
            modelMutator = createImmutableModelUtility('model-id1', initialState);

            expect(() => {
                createImmutableModelUtility('model-id1', modelMutator.immutableModel);
            }).toThrow('The draftModel can not be a proxy');
        });
    });

    describe('Draft Replacement', () => {
        beforeEach(() => {
            StrictModeSettings.setStrictMode('ThrowError');
            let state1 = createTestModel(1, 2);
            modelMutator = createImmutableModelUtility('model-id1', initialState);
        });

        it('throws if utility  not in mutation mode', () => {
            let replacement = createTestModel(1, 2);
            expect(() => {
                modelMutator.replaceDraft(replacement);
            }).toThrow(`Model model-id1 currently in draft/mutation mode. Can not replace.`);
        });

        it('can replace model', () => {
            modelMutator.beginMutation();
            expect(modelMutator.draftHasChanges).toEqual(false);
            expect(modelMutator.draftModel.sumModelProps()).toEqual(3);
            modelMutator.replaceDraft(createTestModel(10, 20));
            expect(modelMutator.draftHasChanges).toEqual(true);
            expect(modelMutator.draftModel.i1).toEqual(10);
            expect(modelMutator.draftModel.i2).toEqual(20);
            expect(modelMutator.draftModel.sumModelProps()).toEqual(30);
            modelMutator.endMutation();
            expect(modelMutator.draftHasChanges).toEqual(false);
            expect(modelMutator.immutableModel.i1).toEqual(10);
            expect(modelMutator.immutableModel.i2).toEqual(20);
            expect(modelMutator.immutableModel.sumModelProps()).toEqual(30);
        });
    });

    test.each([
        ['Off'],
        ['WarnOnly'],
        ['ThrowError'],
    ])('multiple mutation flow: %s', (strictMode: StrictMode) => {
        StrictModeSettings.setStrictMode(strictMode);

        initialState = createTestModel(1, 2);
        modelMutator = createImmutableModelUtility('model-id1', initialState);
        let modelV1 = modelMutator.immutableModel;

        modelMutator.beginMutation();
        modelMutator.draftModel.i1 = 3;
        modelMutator.draftModel.i2 = 4;
        modelMutator.endMutation();
        let modelV2 = modelMutator.immutableModel;

        modelMutator.beginMutation();
        modelMutator.draftModel.i1 = 5;
        modelMutator.draftModel.i2 = 6;
        modelMutator.endMutation();
        let modelV3 = modelMutator.immutableModel;

        if (strictMode === 'ThrowError') {
            expect(() => {
                modelV1.sumModelProps();
            }).toThrow(expectedError);
            expect(() => {
                modelV2.sumModelProps();
            }).toThrow(expectedError);
        } else {
            expect(modelV1.sumModelProps()).toEqual(3);
            expect(modelV2.sumModelProps()).toEqual(7);
        }
        expect(modelV3.sumModelProps()).toEqual(11);
    });
});