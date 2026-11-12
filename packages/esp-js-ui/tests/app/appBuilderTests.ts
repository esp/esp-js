import { describe, it, expect, beforeEach } from 'vitest';
import { AppBuilder } from '../../src/app/appBuilder';
import { ModuleBuilder } from '../../src/modules/moduleBuilder';
import type { Module } from '../../src/modules/types';
import { Container } from 'esp-js-di';
import { EventBus } from 'esp-js';

function makeModule(moduleId: string, opts: {
    onConfigureContainer?: (container: Container) => void,
    onInitialise?: () => Promise<void>,
    onStart?: () => Promise<void>,
    onDispose?: () => void,
} = {}): Module {
    const b = ModuleBuilder.create(moduleId);
    if (opts.onConfigureContainer) b.withContainerConfiguration(opts.onConfigureContainer);
    if (opts.onInitialise) b.withInitialisation(opts.onInitialise);
    if (opts.onStart) b.withStart(opts.onStart);
    const m = b.build();
    if (opts.onDispose) {
        const orig = m.dispose.bind(m);
        (m as any).dispose = () => { orig(); opts.onDispose!(); };
    }
    return m;
}

describe('AppBuilder', () => {

    describe('create() validation', () => {
        it('throws if appName is null', () => {
            expect(() => AppBuilder.create(null as any)).toThrow();
        });

        it('throws if appName is undefined', () => {
            expect(() => AppBuilder.create(undefined as any)).toThrow();
        });

        it('throws if appName is empty string', () => {
            expect(() => AppBuilder.create('')).toThrow();
        });

        it('throws if appName is whitespace only', () => {
            expect(() => AppBuilder.create('   ')).toThrow();
        });

        it('returns a builder for a valid appName', () => {
            expect(AppBuilder.create('my-app')).toBeDefined();
        });
    });

    describe('post-build mutation guard', () => {
        it('throws on withModule after build()', () => {
            const b = AppBuilder.create('app');
            b.build();
            expect(() => b.withModule(makeModule('x'))).toThrow('AppBuilder has already been built');
        });

        it('throws on withContainerConfiguration after build()', () => {
            const b = AppBuilder.create('app');
            b.build();
            expect(() => b.withContainerConfiguration(() => {})).toThrow('AppBuilder has already been built');
        });

        it('throws on withInitialisation after build()', () => {
            const b = AppBuilder.create('app');
            b.build();
            expect(() => b.withInitialisation(async () => {})).toThrow('AppBuilder has already been built');
        });

        it('throws on withStart after build()', () => {
            const b = AppBuilder.create('app');
            b.build();
            expect(() => b.withStart(async () => {})).toThrow('AppBuilder has already been built');
        });

        it('throws on second call to build()', () => {
            const b = AppBuilder.create('app');
            b.build();
            expect(() => b.build()).toThrow('AppBuilder has already been built');
        });
    });

    describe('build()', () => {
        it('exposes the appName', () => {
            const app = AppBuilder.create('my-app').build();
            expect(app.appName).toBe('my-app');
        });

        it('app.container is available before start()', () => {
            const app = AppBuilder.create('app').build();
            expect(app.container).toBeDefined();
        });

        it('app.eventBus is available before start()', () => {
            const app = AppBuilder.create('app').build();
            expect(app.eventBus).toBeDefined();
            expect(app.eventBus).toBeInstanceOf(EventBus);
        });

        it('app.modules is empty before start()', () => {
            const app = AppBuilder.create('app').build();
            expect(app.modules).toHaveLength(0);
        });
    });

    describe('start()', () => {
        it('returns void (Promise<void>)', async () => {
            const app = AppBuilder.create('app').build();
            const result = await app.start();
            expect(result).toBeUndefined();
        });

        it('is idempotent — second call is a no-op', async () => {
            let initCount = 0;
            const mod = makeModule('A', { onInitialise: async () => { initCount++; } });
            const app = AppBuilder.create('app').withModule(mod).build();
            await app.start();
            await app.start();
            expect(initCount).toBe(1);
        });

        it('populates app.modules after start()', async () => {
            const modA = makeModule('A');
            const modB = makeModule('B');
            const app = AppBuilder.create('app').withModule(modA).withModule(modB).build();
            await app.start();
            expect(app.modules).toHaveLength(2);
            expect(app.modules[0].moduleId).toBe('A');
            expect(app.modules[1].moduleId).toBe('B');
        });

        it('resolves lazy module factories', async () => {
            const modA = makeModule('A');
            const app = AppBuilder.create('app').withModule(async () => modA).build();
            await app.start();
            expect(app.modules).toHaveLength(1);
            expect(app.modules[0]).toBe(modA);
        });

        it('registers eventBus as "bus" in the container', async () => {
            const app = AppBuilder.create('app').build();
            await app.start();
            const resolvedBus = app.container.resolve<EventBus>('bus');
            expect(resolvedBus).toBe(app.eventBus);
        });

        it('withContainerConfiguration receives the root container', async () => {
            let receivedContainer: Container = null;
            const app = AppBuilder.create('app')
                .withContainerConfiguration((c) => { receivedContainer = c; })
                .build();
            await app.start();
            expect(receivedContainer).toBe(app.container);
        });

        it('withContainerConfiguration registrations are visible in the container', async () => {
            const app = AppBuilder.create('app')
                .withContainerConfiguration((c) => { c.registerInstance('myService', { value: 42 }); })
                .build();
            await app.start();
            const svc = app.container.resolve<{ value: number }>('myService');
            expect(svc.value).toBe(42);
        });

        it('module configureContainer receives a child container with "bus" visible', async () => {
            let childContainer: Container = null;
            const mod = makeModule('A', {
                onConfigureContainer: (c) => { childContainer = c; }
            });
            const app = AppBuilder.create('app').withModule(mod).build();
            await app.start();
            expect(childContainer).toBeDefined();
            expect(childContainer).not.toBe(app.container);
            expect(childContainer.resolve('bus')).toBe(app.eventBus);
        });

        it('modules registering the same key are isolated from each other and from the root', async () => {
            class SvcA {}
            class SvcB {}
            let resolvedInA: any = null;
            let resolvedInB: any = null;
            const modA = ModuleBuilder.create('A')
                .withContainerConfiguration(c => c.register('svc', SvcA))
                .withInitialisation(async ({moduleContainer}) => { resolvedInA = moduleContainer.resolve('svc'); })
                .build();
            const modB = ModuleBuilder.create('B')
                .withContainerConfiguration(c => c.register('svc', SvcB))
                .withInitialisation(async ({moduleContainer}) => { resolvedInB = moduleContainer.resolve('svc'); })
                .build();
            const app = AppBuilder.create('app').withModule(modA).withModule(modB).build();
            await app.start();
            expect(resolvedInA).toBeInstanceOf(SvcA);
            expect(resolvedInB).toBeInstanceOf(SvcB);
            expect(app.container.isRegistered('svc')).toBe(false);
        });

        it('module hooks receive a ModuleContext with app, moduleContainer and eventBus', async () => {
            let ctx: any = null;
            const mod = ModuleBuilder.create('A')
                .withInitialisation(async c => { ctx = c; })
                .build();
            const app = AppBuilder.create('app').withModule(mod).build();
            await app.start();
            expect(ctx.app).toBe(app);
            expect(ctx.eventBus).toBe(app.eventBus);
            expect(ctx.moduleContainer).not.toBe(app.container);
            expect(ctx.moduleContainer.resolve('bus')).toBe(app.eventBus);
        });

        it('full lifecycle order: configureContainer → initialise hooks → module initialise → module start → start hooks', async () => {
            const callOrder: string[] = [];
            const mod = makeModule('A', {
                onConfigureContainer: () => { callOrder.push('mod-configure'); },
                onInitialise: async () => { callOrder.push('mod-init'); },
                onStart: async () => { callOrder.push('mod-start'); },
            });
            const app = AppBuilder.create('app')
                .withContainerConfiguration(() => { callOrder.push('app-configure'); })
                .withInitialisation(async () => { callOrder.push('app-init'); })
                .withStart(async () => { callOrder.push('app-start'); })
                .withModule(mod)
                .build();
            await app.start();
            expect(callOrder).toEqual(['app-configure', 'mod-configure', 'app-init', 'mod-init', 'mod-start', 'app-start']);
        });

        it('app-level withInitialisation hook runs before module initialise()', async () => {
            const callOrder: string[] = [];
            const mod = makeModule('A', { onInitialise: async () => { callOrder.push('mod-init'); } });
            const app = AppBuilder.create('app')
                .withInitialisation(async () => { callOrder.push('app-init'); })
                .withModule(mod)
                .build();
            await app.start();
            expect(callOrder).toEqual(['app-init', 'mod-init']);
        });

        it('app-level withInitialisation failure is fatal: rejects without calling module initialise', async () => {
            let moduleInitCalled = false;
            const mod = makeModule('A', { onInitialise: async () => { moduleInitCalled = true; } });
            const app = AppBuilder.create('app')
                .withInitialisation(async () => { throw new Error('app-hook-fail'); })
                .withModule(mod)
                .build();
            await expect(app.start()).rejects.toThrow('app-hook-fail');
            expect(moduleInitCalled).toBe(false);
        });

        it('module initialise() failure is isolated: other modules still initialise', async () => {
            const initCalled: string[] = [];
            const modA = makeModule('A', { onInitialise: async () => { initCalled.push('A'); } });
            const modB = makeModule('B', { onInitialise: async () => { initCalled.push('B'); throw new Error('B-fail'); } });
            const app = AppBuilder.create('app').withModule(modA).withModule(modB).build();
            await app.start();
            expect(initCalled).toContain('A');
            expect(initCalled).toContain('B');
        });

        it('module start() failure is isolated: other modules still start', async () => {
            const startCalled: string[] = [];
            const modA = makeModule('A', { onStart: async () => { startCalled.push('A'); } });
            const modB = makeModule('B', { onStart: async () => { startCalled.push('B'); throw new Error('B-start-fail'); } });
            const app = AppBuilder.create('app').withModule(modA).withModule(modB).build();
            await app.start();
            expect(startCalled).toContain('A');
            expect(startCalled).toContain('B');
        });

        it('module start() runs before app-level withStart hooks', async () => {
            const callOrder: string[] = [];
            const mod = makeModule('A', { onStart: async () => { callOrder.push('mod-start'); } });
            const app = AppBuilder.create('app')
                .withStart(async () => { callOrder.push('app-start'); })
                .withModule(mod)
                .build();
            await app.start();
            expect(callOrder).toEqual(['mod-start', 'app-start']);
        });

        it('app-level withStart hook throws after module starts complete', async () => {
            const modStarted: string[] = [];
            const mod = makeModule('A', { onStart: async () => { modStarted.push('A'); } });
            const app = AppBuilder.create('app')
                .withStart(async () => { throw new Error('app-start-fail'); })
                .withModule(mod)
                .build();
            await expect(app.start()).rejects.toThrow('app-start-fail');
            expect(modStarted).toContain('A');
        });

        it('lazy module factory failure is isolated: the module is skipped, the others load, start and later dispose', async () => {
            const lifecycle: string[] = [];
            const track = (id: string) => makeModule(id, {
                onInitialise: async () => { lifecycle.push(`${id}:init`); },
                onStart: async () => { lifecycle.push(`${id}:start`); },
                onDispose: () => { lifecycle.push(`${id}:dispose`); },
            });
            const badFactory = async (): Promise<Module> => { throw new Error('factory-fail'); };
            const app = AppBuilder.create('app')
                .withModule(track('eager'))
                .withModule(async () => track('lazy'))
                .withModule(badFactory)
                .build();
            await app.start();
            expect(app.modules.map(m => m.moduleId)).toEqual(['eager', 'lazy']);
            expect(lifecycle).toEqual(expect.arrayContaining(['eager:init', 'lazy:init', 'eager:start', 'lazy:start']));
            app.dispose();
            expect(lifecycle).toEqual(expect.arrayContaining(['eager:dispose', 'lazy:dispose']));
        });

        it('module whose initialise() failed is not started; the other modules are', async () => {
            const startCalled: string[] = [];
            const modA = makeModule('A', { onStart: async () => { startCalled.push('A'); } });
            const modB = makeModule('B', {
                onInitialise: async () => { throw new Error('B-fail'); },
                onStart: async () => { startCalled.push('B'); },
            });
            const app = AppBuilder.create('app').withModule(modA).withModule(modB).build();
            await app.start();
            expect(startCalled).toEqual(['A']);
        });
    });

    describe('dispose()', () => {
        it('disposes modules in reverse load order', async () => {
            const disposeOrder: string[] = [];
            const modA = makeModule('A', { onDispose: () => disposeOrder.push('A') });
            const modB = makeModule('B', { onDispose: () => disposeOrder.push('B') });
            const modC = makeModule('C', { onDispose: () => disposeOrder.push('C') });
            const app = AppBuilder.create('app')
                .withModule(modA)
                .withModule(modB)
                .withModule(modC)
                .build();
            await app.start();
            app.dispose();
            expect(disposeOrder).toEqual(['C', 'B', 'A']);
        });

        it('is a no-op before start() is called', () => {
            const app = AppBuilder.create('app').build();
            expect(() => app.dispose()).not.toThrow();
        });

        it('isolates module dispose errors (one failing dispose does not prevent others)', async () => {
            const disposeOrder: string[] = [];
            const modA = makeModule('A', { onDispose: () => disposeOrder.push('A') });
            const modB = makeModule('B', { onDispose: () => { throw new Error('B-dispose-fail'); } });
            const modC = makeModule('C', { onDispose: () => disposeOrder.push('C') });
            const app = AppBuilder.create('app')
                .withModule(modA)
                .withModule(modB)
                .withModule(modC)
                .build();
            await app.start();
            expect(() => app.dispose()).not.toThrow();
            // Reverse order: C disposed, B throws (caught), A disposed
            expect(disposeOrder).toContain('C');
            expect(disposeOrder).toContain('A');
        });

        it('second dispose call is a no-op after first dispose', async () => {
            const disposeOrder: string[] = [];
            const mod = makeModule('A', { onDispose: () => disposeOrder.push('A') });
            const app = AppBuilder.create('app').withModule(mod).build();
            await app.start();
            app.dispose();
            app.dispose();
            expect(disposeOrder).toHaveLength(1);
        });

        it('disposes the EventBus, its store subscriptions and the root container', async () => {
            let subscriptionDisposed = false;
            const mod = ModuleBuilder.create('A')
                .withInitialisation(async ({eventBus}) => {
                    eventBus.storeBuilder('s', {n: 0})
                        .withEventHandler('E', () => {})
                        .withEventSubscription(() => ({dispose: () => { subscriptionDisposed = true; }}))
                        .build();
                })
                .build();
            const app = AppBuilder.create('app').withModule(mod).build();
            await app.start();
            app.dispose();
            expect(subscriptionDisposed).toBe(true);
            expect(app.eventBus.isDisposed).toBe(true);
            expect(app.container.isDisposed).toBe(true);
        });

        it('disposing one module does not dispose the root container', async () => {
            const modA = makeModule('A');
            const modB = makeModule('B');
            const app = AppBuilder.create('app').withModule(modA).withModule(modB).build();
            await app.start();
            modA.dispose();
            expect(app.container.isDisposed).toBe(false);
            expect(app.container.resolve('bus')).toBe(app.eventBus);
        });

        it('disposes the EventBus even if start() was never called', () => {
            const app = AppBuilder.create('app').build();
            app.dispose();
            expect(app.eventBus.isDisposed).toBe(true);
        });

        it('start() throws after dispose()', async () => {
            const app = AppBuilder.create('app').build();
            app.dispose();
            await expect(app.start()).rejects.toThrow(/disposed/);
        });

        it('start() stops if the app is disposed while modules load', async () => {
            let initialised = false;
            let resolveLoad: (m: Module) => void;
            const lazy = () => new Promise<Module>(r => { resolveLoad = r; });
            const app = AppBuilder.create('app').withModule(lazy).build();
            const startPromise = app.start();
            app.dispose();
            resolveLoad!(makeModule('A', {onInitialise: async () => { initialised = true; }}));
            await startPromise;
            expect(initialised).toBe(false);
        });
    });
});
