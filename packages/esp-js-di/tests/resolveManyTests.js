import microid from '../src/index';

describe('Container', () => {

    let container;

    beforeEach(() => {
        container = new microid.Container();
    });

    describe('.resolveMany() functionality', () => {

        it('should resolve multiple string specs and return a keyed object', () => {
            container.registerInstance('serviceA', { id: 'A' });
            container.registerInstance('serviceB', { id: 'B' });
            const result = container.resolveMany('serviceA', 'serviceB');
            expect(result.serviceA).toBeDefined();
            expect(result.serviceA.id).toBe('A');
            expect(result.serviceB).toBeDefined();
            expect(result.serviceB.id).toBe('B');
        });

        it('should support destructuring of resolved dependencies', () => {
            container.registerInstance('serviceA', { id: 'A' });
            container.registerInstance('serviceB', { id: 'B' });
            const { serviceA, serviceB } = container.resolveMany('serviceA', 'serviceB');
            expect(serviceA.id).toBe('A');
            expect(serviceB.id).toBe('B');
        });

        it('should return the same singleton instance for string specs', () => {
            container.registerInstance('serviceA', { id: 'A' });
            const { serviceA: first } = container.resolveMany('serviceA');
            const { serviceA: second } = container.resolveMany('serviceA');
            expect(first).toBe(second);
        });

        it('should resolve an object spec with additionalDependencies', () => {
            let receivedDeps;
            function MyService(...args) {
                receivedDeps = args;
            }
            container.registerFactory('myService', (c, ...deps) => {
                receivedDeps = deps;
                return new MyService(...deps);
            });
            container.resolveMany({ name: 'myService', additionalDependencies: ['extra1', 'extra2'] });
            expect(receivedDeps).toEqual(['extra1', 'extra2']);
        });

        it('should mix string specs and object specs in the same call', () => {
            container.registerInstance('serviceA', { id: 'A' });
            let receivedDeps;
            container.registerFactory('serviceB', (c, ...deps) => {
                receivedDeps = deps;
                return { id: 'B' };
            });
            const { serviceA, serviceB } = container.resolveMany(
                'serviceA',
                { name: 'serviceB', additionalDependencies: ['dep1'] }
            );
            expect(serviceA.id).toBe('A');
            expect(serviceB.id).toBe('B');
            expect(receivedDeps).toEqual(['dep1']);
        });

        it('should resolve from a child container, inheriting parent registrations', () => {
            container.registerInstance('parentService', { id: 'parent' });
            const child = container.createChildContainer();
            child.registerInstance('childService', { id: 'child' });
            const { parentService, childService } = child.resolveMany('parentService', 'childService');
            expect(parentService.id).toBe('parent');
            expect(childService.id).toBe('child');
        });

        it('should throw when an unregistered string spec is provided', () => {
            expect(() => container.resolveMany('notRegistered')).toThrow();
        });

        it('should throw when an object spec has an unregistered name', () => {
            expect(() => container.resolveMany({ name: 'notRegistered', additionalDependencies: [] })).toThrow();
        });

        it('should throw when called with no arguments', () => {
            expect(() => container.resolveMany()).toThrow('Error calling resolveMany(...specs). At least one spec argument must be provided');
        });

        it('should throw when an object spec is missing the name property', () => {
            expect(() => container.resolveMany({ additionalDependencies: [] })).toThrow();
        });

        it('should resolve an object spec with no additionalDependencies property', () => {
            container.registerInstance('serviceA', { id: 'A' });
            const { serviceA } = container.resolveMany({ name: 'serviceA' });
            expect(serviceA.id).toBe('A');
        });
    });
});
