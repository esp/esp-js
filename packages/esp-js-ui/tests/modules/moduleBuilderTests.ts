import { describe, it, expect, beforeEach } from 'vitest';
import { ModuleBuilder } from '../../src/modules/moduleBuilder';
import type { Module } from '../../src/modules/types';

function makeFakeContainer() {
    let disposeCount = 0;
    return {
        get disposeCount() { return disposeCount; },
        dispose() { disposeCount++; },
        createChildContainer: () => makeFakeContainer(),
        register: (_n: string, _f: any) => ({ singleton: () => {}, inject: () => ({}) }),
        registerInstance: (_n: string, _i: any) => {},
        resolve: <T>(_n: string): T => null as any,
        isRegistered: (_n: string) => false,
    };
}

describe('ModuleBuilder', () => {

    describe('create() validation', () => {
        it('throws if moduleId is null', () => {
            expect(() => ModuleBuilder.create(null as any)).toThrow();
        });

        it('throws if moduleId is undefined', () => {
            expect(() => ModuleBuilder.create(undefined as any)).toThrow();
        });

        it('throws if moduleId is empty string', () => {
            expect(() => ModuleBuilder.create('')).toThrow();
        });

        it('throws if moduleId is whitespace only', () => {
            expect(() => ModuleBuilder.create('   ')).toThrow();
        });

        it('returns a builder for a valid moduleId', () => {
            const b = ModuleBuilder.create('my-module');
            expect(b).toBeDefined();
        });
    });

    describe('post-build mutation guard', () => {
        it('throws on withView after build()', () => {
            const b = ModuleBuilder.create('x');
            b.build();
            const FakeView = () => null;
            expect(() => b.withView('s', FakeView as any, 'r')).toThrow('ModuleBuilder has already been built');
        });

        it('throws on withInitialisation after build()', () => {
            const b = ModuleBuilder.create('x');
            b.build();
            expect(() => b.withInitialisation(async () => {})).toThrow('ModuleBuilder has already been built');
        });

        it('throws on withStart after build()', () => {
            const b = ModuleBuilder.create('x');
            b.build();
            expect(() => b.withStart(async () => {})).toThrow('ModuleBuilder has already been built');
        });

        it('throws on withContainerConfiguration after build()', () => {
            const b = ModuleBuilder.create('x');
            b.build();
            expect(() => b.withContainerConfiguration((_c: any) => {})).toThrow('ModuleBuilder has already been built');
        });

        it('throws on second call to build()', () => {
            const b = ModuleBuilder.create('x');
            b.build();
            expect(() => b.build()).toThrow('ModuleBuilder has already been built');
        });
    });

    describe('viewBindings', () => {
        it('module.viewBindings is empty when no withView calls', () => {
            const m = ModuleBuilder.create('x').build();
            expect(m.viewBindings).toHaveLength(0);
        });

        it('single withView produces one binding with correct storeId, viewComponent and region', () => {
            const FakeView = () => null;
            const m = ModuleBuilder.create('x')
                .withView('store-1', FakeView as any, 'main')
                .build();
            expect(m.viewBindings).toHaveLength(1);
            expect(m.viewBindings[0].storeId).toBe('store-1');
            expect(m.viewBindings[0].viewComponent).toBe(FakeView);
            expect(m.viewBindings[0].region).toBe('main');
        });

        it('multiple withView calls accumulate in registration order', () => {
            const ViewA = () => null;
            const ViewB = () => null;
            const m = ModuleBuilder.create('x')
                .withView('store-1', ViewA as any, 'header')
                .withView('store-2', ViewB as any, 'footer')
                .build();
            expect(m.viewBindings).toHaveLength(2);
            expect(m.viewBindings[0].storeId).toBe('store-1');
            expect(m.viewBindings[1].storeId).toBe('store-2');
        });

        it('module.viewBindings array is frozen (push throws)', () => {
            const m = ModuleBuilder.create('x').build();
            expect(() => (m.viewBindings as any[]).push({})).toThrow();
        });
    });

    describe('configureContainer', () => {
        it('calls registered withContainerConfiguration fn with the provided container', () => {
            let received: any = null;
            const fakeContainer = makeFakeContainer();
            const m = ModuleBuilder.create('x')
                .withContainerConfiguration((c: any) => { received = c; })
                .build();
            m.configureContainer(fakeContainer as any);
            expect(received).toBe(fakeContainer);
        });

        it('calls multiple withContainerConfiguration fns in registration order', () => {
            const order: number[] = [];
            const fakeContainer = makeFakeContainer();
            const m = ModuleBuilder.create('x')
                .withContainerConfiguration(() => order.push(1))
                .withContainerConfiguration(() => order.push(2))
                .build();
            m.configureContainer(fakeContainer as any);
            expect(order).toEqual([1, 2]);
        });

        it('second configureContainer call disposes previous container and stores new one', () => {
            const container1 = makeFakeContainer();
            const container2 = makeFakeContainer();
            const m = ModuleBuilder.create('x').build();
            m.configureContainer(container1 as any);
            m.configureContainer(container2 as any);
            expect(container1.disposeCount).toBe(1);
        });
    });

    describe('initialise', () => {
        it('calls registered withInitialisation fn and resolves', async () => {
            let called = false;
            const m = ModuleBuilder.create('x')
                .withInitialisation(async () => { called = true; })
                .build();
            await m.initialise();
            expect(called).toBe(true);
        });

        it('calls multiple withInitialisation fns in registration order', async () => {
            const order: number[] = [];
            const m = ModuleBuilder.create('x')
                .withInitialisation(async () => { order.push(1); })
                .withInitialisation(async () => { order.push(2); })
                .build();
            await m.initialise();
            expect(order).toEqual([1, 2]);
        });

        it('rejects if a hook throws', async () => {
            const m = ModuleBuilder.create('x')
                .withInitialisation(async () => { throw new Error('init-boom'); })
                .build();
            await expect(m.initialise()).rejects.toThrow('init-boom');
        });

        it('resolves when no hooks registered', async () => {
            const m = ModuleBuilder.create('x').build();
            await expect(m.initialise()).resolves.toBeUndefined();
        });
    });

    describe('start', () => {
        it('calls registered withStart fn and resolves', async () => {
            let called = false;
            const m = ModuleBuilder.create('x')
                .withStart(async () => { called = true; })
                .build();
            await m.start();
            expect(called).toBe(true);
        });

        it('calls multiple withStart fns in registration order', async () => {
            const order: number[] = [];
            const m = ModuleBuilder.create('x')
                .withStart(async () => { order.push(1); })
                .withStart(async () => { order.push(2); })
                .build();
            await m.start();
            expect(order).toEqual([1, 2]);
        });

        it('rejects if a hook throws', async () => {
            const m = ModuleBuilder.create('x')
                .withStart(async () => { throw new Error('start-boom'); })
                .build();
            await expect(m.start()).rejects.toThrow('start-boom');
        });

        it('resolves when no hooks registered', async () => {
            const m = ModuleBuilder.create('x').build();
            await expect(m.start()).resolves.toBeUndefined();
        });
    });

    describe('dispose', () => {
        it('calls dispose on stored child container after configureContainer', () => {
            const fakeContainer = makeFakeContainer();
            const m = ModuleBuilder.create('x').build();
            m.configureContainer(fakeContainer as any);
            m.dispose();
            expect(fakeContainer.disposeCount).toBe(1);
        });

        it('is a no-op (no throw) when configureContainer was never called', () => {
            const m = ModuleBuilder.create('x').build();
            expect(() => m.dispose()).not.toThrow();
        });

        it('second dispose call does not call container.dispose twice', () => {
            const fakeContainer = makeFakeContainer();
            const m = ModuleBuilder.create('x').build();
            m.configureContainer(fakeContainer as any);
            m.dispose();
            m.dispose();
            expect(fakeContainer.disposeCount).toBe(1);
        });
    });
});
