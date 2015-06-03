"use strict";

import microdi from '../';

describe('Container', () =>  {

    var container;

    beforeEach(() => {
        container = new microdi.Container();
    });

    describe('.register()/.resolve() functionality', () =>  {

        it('should register/resolve an object with no dependencies', () =>  {
            var Foo = createObject({ bar: { value : 5 }});
            container.register('foo', Foo);
            var foo = container.resolve('foo');
            expect(foo.bar).toBeDefined();
            expect(foo.bar).toBe(5);
        });

        it('should call init with resolving if object has init method', () =>  {
            var Foo = {
                init: function() {
                    this._bar = 5;
                    return this;
                },
                get bar() { return this._bar; }
            };
            container.register('foo', Foo);
            var foo = container.resolve('foo');
            expect(foo.bar).toBeDefined();
            expect(foo.bar).toBe(5);
        });

        it('should register/resolve an object with string named dependencies', () =>  {
            var A = createObject();
            var B = createObject();
            var C = createObject();
            container.register('a', A);
            container.register('b', B, ['a']);
            container.register('c', C, ['b']);
            var c = container.resolve('c');
            expect(c.dependencies.length).toBe(1);
            expect(B.isPrototypeOf(c.dependencies[0])).toBe(true);
        });

        it('should throw if circular dependency detected during .resolve()', () =>  {
            var A = createObject();
            var B = createObject();
            var C = createObject();
            container.register('a', A, ['b']);
            container.register('b', B, ['a']);
            container.register('c', C, ['b']);
            expect(() =>  {
                var b = container.resolve('b');
            }).toThrow();
            expect(() =>  {
                var a = container.resolve('a');
            }).toThrow();
            expect(() =>  {
                var c = container.resolve('c');
            }).toThrow();
        });

        it('should be able able to register/resolve many objects with the same key', () =>  {
            pending();
        });

        it('should register/resolve a given instance', () =>  {
            var instance = {};
            container.registerInstance('a', instance);
            var resolved = container.resolve('a');
            expect(resolved).toBe(instance);
        });

        describe('constructor functions', () =>  {
            it('should register/resolve functions with new', () =>  {
                var Foo = createFunction();
                var Bar = createFunction();
                container.register('foo', Foo);
                container.register('bar', Bar, ['foo']);
                var bar = container.resolve('bar');
                var foo = container.resolve('foo');
                expect(bar.dependencies[0]).toBe(foo);
            });
        });

        describe('dependency resolvers', () =>  {

            it('should register/resolve a dependency registered with a factory resolver', () =>  {
                var A = createObject();
                container.register('a', A, [{
                    type: "factory",
                    resolve: function()
                    {
                        return { foo: 6 };
                    }
                }]);
                var a = container.resolve('a');
                expect(a.dependencies[0].foo).toBe(6);
            });

            it('should register/resolve a dependency registered with an auto factory resolver', () =>  {
                var A = createObject();
                var B = createObject();
                container.register('a', A);
                // inject an auto factory function to B for it's dependency 'a'
                container.register('b', B, [{
                    type: "autoFactory",
                    name: 'a'
                }]);
                var b = container.resolve('b');
                var autoFactory = b.dependencies[0];
                var a1 = autoFactory(), a2 = autoFactory(), a3 = autoFactory();
                expect(a1 === a2 && a2 === a3).toBe(true);
            });

            it('should pass container to dependency resolver', () =>  {
                pending();
            });

            it('should throw if register called with unknown plugin', () =>  {
                pending();
            });

            it('should resolve from custom resolvers', () =>  {
                pending();
            });
        });

        describe('lifetime management', () =>  {
            it('should register/resolve a new instance each time if transiently registered', () =>  {
                var A = createObject();
                container.register('a', A).transient();
                var a1 = container.resolve('a');
                var a2 = container.resolve('a');
                expect(a1).not.toBe(a2);
            });

            it('should register/resolve the same instance if registered as singleton', () =>  {
                var A = createObject();
                container.register('a', A).singleton();
                var a1 = container.resolve('a');
                var a2 = container.resolve('a');
                expect(a1).toBe(a2);
            });
        });
    });

    describe('.createChildContainer()', () =>  {

        it('should throw if called with arguments', () =>  {
            pending();
        });

        describe('.register()/.resolve() functionality', () =>  {

            it('should default to resolving from parent when no configuration override exists in the child', () =>  {
                var A = createObject();
                container.register('a', A);
                var childContainer = container.createChildContainer();
                var a = childContainer.resolve('a');
                expect(A.isPrototypeOf(a)).toBe(true);
            });

            it('should register singleton instances with the container that owns the registration', () =>  {
            	// this is an interesting edge case whereby if the root container owns the singleton registration
                // yet it's first resolved by a child, then the cached instance should belong in the parent
                var A = createObject();
                container.register('a', A).singleton();
                var childContainer = container.createChildContainer();
                var c2a = childContainer.resolve('a');
                var c1a = container.resolve('a');
                expect(c2a).toBe(c1a);
            });
        });

        describe('registration overrides', () =>  {
            it('should resolve from child when parent registration overridden', () =>  {
                var A = createObject();
                var B = createObject();
                container.register('a', A);
                container.register('b', B);
                var childContainer = container.createChildContainer();
                // override 'a' configuration to make it take 'b' as a dependency.
                childContainer.register('a', A, ['b']);
                var a1 = container.resolve('a');
                var a2 = childContainer.resolve('a');
                expect(a1).not.toBe(a2);
                expect(a1.dependencies.length).toBe(0);
                expect(a2.dependencies.length).toBe(1);
            });

            it('should resolve a transient instance when a child container overrides a parents singleton registration', () =>  {
                var B = createObject();
                container.register('b', B).singleton();
                var b1 = container.resolve('b');
                var childContainer = container.createChildContainer();
                childContainer.register('b', B).transient();
                var b2 = childContainer.resolve('b');
                expect(b1).not.toBe(b2);
                var b3 = childContainer.resolve('b');
                expect(b2).not.toBe(b3);
                var b4 = container.resolve('b');
                expect(b1).toBe(b4);
            });

        });

        describe('lifetime management', () =>  {

            it('should register/resolve the same instance per container if registered as singletonPerContainer', () =>  {
                var A = createObject();
                container.register('a', A).singletonPerContainer();
                var childContainer = container.createChildContainer();
                var a1 = container.resolve('a');
                var a2 = container.resolve('a');
                var b1 = childContainer.resolve('a');
                var b2 = childContainer.resolve('a');
                expect(a1).toBe(a2);
                expect(b1).toBe(b2);
                expect(a1).not.toBe(b1);
            });

        });

        describe('dependency resolvers', () =>  {
            it('should resolve from child dependency resolver when parent registration overridden', () =>  {
                var CustomResolver = {
                    init: function(id) {
                        this.id = id;
                        return this;
                    },
                    type: "myResolver",
                    resolve: function(container) {
                        return this.id;
                    }
                };

                var A = createObject();
                container.addResolver("myResolver", Object.create(CustomResolver).init("container1Resolver"));
                container.register('a', A, [{ type: "myResolver" }]).singleton();

                var childContainer = container.createChildContainer();
                // replace the parent containers resolver
                childContainer.addResolver("myResolver", Object.create(CustomResolver).init("container2Resolver"));
                // you must also override the objects registration if it's a singleton otherwise
                // the container will just delegate to the root for resolution as that's whats owns the registration
                childContainer.register('a', A, [{ type: "myResolver" }]).singleton();

                var a1 = container.resolve('a');
                expect(a1.dependencies[0]).toBe("container1Resolver");
                var a2 = childContainer.resolve('a');
                expect(a2.dependencies[0]).toBe("container2Resolver");
            });
        });

    });

    describe('.dispose() container', () =>  {

        function createDisposable() {
            return createObject({
                isDisposed: {
                    get: function() { return this._isDisposed || false;},
                    set: function(value) { this._isDisposed = value; }
                },
                dispose: { value: function() { this._isDisposed = true; }}
            });
        }

        it('should dispose all singleton objects on container dispose', () =>  {
            var A = createDisposable();
            container.register('a', A).singleton();
            var a1 = container.resolve('a');
            container.dispose();
            expect(a1.isDisposed).toBe(true);
        });

        it('should not dispose transient objects on container dispose', () =>  {
            var A = createDisposable();
            container.register('a', A).transient();
            var a1 = container.resolve('a');
            container.dispose();
            expect(a1.isDisposed).toBe(false);
        });

        it('should not dispose external objects on container dispose', () =>  {
            var A = createDisposable();
            container.registerInstance('a', Object.create(A).init());
            var a1 = container.resolve('a');
            container.dispose();
            expect(a1.isDisposed).toBe(false);
        });

        it('should dispose singletonPerContainer instance only in the child container that was disposed', () =>  {
            var A = createDisposable();
            container.register('a', A).singletonPerContainer();
            var childContainer = container.createChildContainer();
            var a = container.resolve('a');
            var a1 = childContainer.resolve('a');
            childContainer.dispose();
            expect(a.isDisposed).toBe(false);
            expect(a1.isDisposed).toBe(true);
        });

        it('should not resolve new instances once disposed', () =>  {
            var A = createDisposable();
            container.register('a', A);
            container.dispose();
            expect(() =>  {
                container.resolve('a');
            }).toThrow(new Error("Container has been disposed"));
        });

        it('should dispose child container on parent container dispose', () =>  {
            var A = createDisposable();
            var B = createDisposable();
            container.register('a', A);
            var childContainer = container.createChildContainer();
            childContainer.register('b', B);
            var a = container.resolve('a');
            var b = childContainer.resolve('b');
            container.dispose();
            expect(a.isDisposed).toBe(true);
            expect(b.isDisposed).toBe(true);
        });

        it('should not resolve new instance from child once parent is disposed', () =>  {
            var A = createDisposable();
            var childContainer = container.createChildContainer();
            childContainer.register('a', A);
            container.dispose();
            expect(() =>  {
                childContainer.resolve('a');
            }).toThrow(new Error("Container has been disposed"));
        });

        it('should not dispose parent on child container dispose', () =>  {
            var A = createDisposable();
            var B = createDisposable();
            container.register('a', A);
            var childContainer = container.createChildContainer();
            childContainer.register('b', B);
            var a = container.resolve('a');
            var b = childContainer.resolve('b');
            childContainer.dispose();
            expect(a.isDisposed).toBe(false);
            expect(b.isDisposed).toBe(true);
        });

        it('should still be able to resolve from parent on child container dispose', () =>  {
            var A = createDisposable();
            container.register('a', A).singletonPerContainer();
            var childContainer = container.createChildContainer();
            var a = container.resolve('a');
            var a1 = childContainer.resolve('a');
            childContainer.dispose();
            expect(a.isDisposed).toBe(false);
            expect(a1.isDisposed).toBe(true);
            var a2 = container.resolve('a');
            expect(a2.isDisposed).toBe(false);
        });
    });

    describe('incorrect argument handling', () =>  {

        it('should throw if .registerObject() called with incorrect arguments', () =>  {
            pending();
        });

        it('should throw if .registerObject() called with existing registration key', () =>  {
            pending();
        });

        it('should throw if .register() called with incorrect arguments', () =>  {
            pending();
        });

        it('should throw if .register() called with existing registration key', () =>  {
            pending();
        });

        it('should throw if .registerMany() called with incorrect arguments', () =>  {
            pending();
        });

        it('should throw if .registerMany() called with existing registration key', () =>  {
            pending();
        });

        it('should throw if .resolve() called with incorrect arguments', () =>  {
            pending();
        });

        it('should throw if .resolveAll() called with incorrect arguments', () =>  {
            pending();
        });
    });

    function createObject(props) {
        var o = Object.create(Object.prototype, {
                init : {
                    value: function() {
                        this.dependencies = Array.prototype.slice.call(arguments);
                        return this;
                    }
                }
            }
        );

        if(props !== undefined)  Object.defineProperties(o, props);

        return o;
    }

    function createFunction() {
        function AFunction() {
            this.dependencies = Array.prototype.slice.call(arguments);
        }
        return AFunction;
    }
});