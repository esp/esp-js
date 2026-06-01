# esp-js-di

## Package Purpose

A standalone IoC (Inversion of Control) dependency injection container. Supports singleton and transient lifetimes, child containers, named resolvers, and registration groups. Used internally by `esp-js-ui` to manage per-application and per-module service lifetimes, but can be used independently of the rest of the ESP ecosystem.

## Role in Monorepo

- **No dependencies** on other esp-* packages — fully standalone
- Published as `esp-js-di` on npm
- Written in **JavaScript** (not TypeScript) — the only non-TypeScript package in the monorepo

## Build and Test

```bash
npm run build-dev      # vite build → .dist/esp-js-di.js + .dist/esp-js-di.esm.js
npm run build-prod     # adds .dist/esp-js-di.min.js (minified UMD)
npm test               # vitest --watch
npm run test-ci        # vitest run (CI)
npm run dev            # vite build --watch
```

Output: `.dist/esp-js-di.js` (UMD), `.dist/esp-js-di.esm.js` (ESM). No TypeScript declarations generated (JavaScript source).

## Source Structure

```
src/
  container.js              # Container class — primary public API
  registrationModifier.js   # Fluent builder returned by container.register()
  resolverContext.js        # Internal resolution tracking (cycle detection)
  instanceLifecycleType.js  # Enum: singleton | transient | external
  resolverNames.js          # Built-in resolver name constants
  isRegisteredQueryOptions.js  # Options for isRegistered() queries
  espDiConsts.js            # Internal constants
  guard.js                  # Runtime argument validation
  utils.js                  # Utility helpers
  index.js                  # Re-exports Container as default and named export
```

## Key Concepts and Patterns

### Container API

```javascript
import {Container} from 'esp-js-di';

const container = new Container();

// Register a class (SINGLETON by default — see Gotchas)
container.register('myService', MyService);

// Make it transient (new instance per resolve)
container.register('myService', MyService).transient();

// Register with constructor injection
container.register('myService', MyService).inject('depA', 'depB');

// Register a pre-existing instance
container.registerInstance('myService', existingInstance);

// Register a factory function
container.registerFactory('myService', (c) => new MyService(c.resolve('dep')));

// Resolve
const svc = container.resolve('myService');

// Resolve several at once into a keyed object (destructure-friendly)
const {bus, myService} = container.resolveMany('bus', 'myService');
// Per-item constructor deps via object specs:
const {svc} = container.resolveMany({name: 'svc', additionalDependencies: [arg]});

// Resolve a group (returns array)
const all = container.resolveGroup('myGroup');
```

### Child Containers

Child containers prototypically inherit registrations from their parent. Registrations in the child shadow the parent. Disposing a child container disposes its resolved singletons but does not affect the parent.

```javascript
const child = container.createChildContainer();
child.register('override', SpecialService).singleton();
const svc = child.resolve('myService'); // falls through to parent if not in child
child.dispose(); // cleans up child singletons
```

This pattern is useful when an app has app-wide services in the root container and module-scoped services in child containers — child containers can see parent registrations but not vice versa.

### Registration Modifiers

The fluent interface on `container.register()` returns a `RegistrationModifier`:

```javascript
container
    .register('myService', MyService)
    .singleton()              // single instance per container
    .inject('dep1', 'dep2')  // constructor injection by name
    .inGroup('myGroup');     // add to a named group (resolveGroup returns all)
```

### Instance Lifecycle Types

- `singleton` (default) — one instance per container level
- `transient` — new instance per `resolve()`
- `singletonPerContainer` — one instance per container in a parent/child hierarchy (each child resolves its own)
- `external` — pre-existing instance registered via `registerInstance()`

## Public API

```javascript
import {Container} from 'esp-js-di';           // named export
import Container from 'esp-js-di';             // default export (same class)
```

Primary surface: `Container` class. `RegistrationModifier` is returned by `register()` but not typically imported directly.

## Testing Approach

- Test files: `tests/**/*Tests.js` (JavaScript)
- Tests directly instantiate `Container` — no mocks
- Coverage includes: singleton lifecycle, child containers, group resolution, cycle detection, disposal

## Common Tasks

**Register the eventbus and services:**
```javascript
container.register('bus', EventBus).singleton();
container.register('myService', MyService).inject('bus').singleton();
```

**Create and dispose a module's child container:**
```javascript
const moduleContainer = rootContainer.createChildContainer();
moduleContainer.register('localService', LocalService).singleton();
// ... use it ...
moduleContainer.dispose(); // LocalService.dispose() called automatically if it implements Disposable
```

**Check if registered:**
```javascript
if (!container.isRegistered('myService')) {
    container.register('myService', MyService).singleton();
}
```

## Gotchas

- **Registrations default to `singleton`, not transient** — call `.transient()` explicitly for per-resolve instances. The `RegistrationModifier` constructor sets singleton, and `register()` defaults the lifecycle to singleton
- The source is JavaScript, not TypeScript. There are no TypeScript types in the source; type definitions are not generated
- `resolve()` throws if the name is not registered — check `isRegistered()` first if registration is optional
- Circular dependency detection is runtime-only — cycles throw with a descriptive error
- Child containers use prototypal inheritance for `_registrations` — this means a child can see parent registrations but registering in the parent after child creation is not guaranteed to be visible in the child (depends on prototype chain timing)
- `dispose()` on a container does not automatically call `dispose()` on resolved instances unless those instances implement the `Disposable` interface and were tracked
