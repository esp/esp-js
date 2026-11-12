# esp-js-di

## Package Purpose

A standalone IoC (Inversion of Control) dependency injection container. Supports singleton and transient lifetimes, child containers, named resolvers, and registration groups. Used internally by `esp-js-ui` to manage per-application and per-module service lifetimes, but can be used independently of the rest of the ESP ecosystem.

## Role in Monorepo

- **No dependencies** on other esp-* packages — fully standalone
- Published as `esp-js-di` on npm
- Written in **JavaScript** (not TypeScript) — the only non-TypeScript package in the monorepo

## Build and Test

```bash
npm run build-dev      # vite build → .dist/esp-js-di.js + .dist/esp-js-di.esm.mjs
npm run build-prod     # adds .dist/esp-js-di.min.js (minified UMD)
npm test               # vitest --watch
npm run test-ci        # vitest run (CI)
npm run dev            # vite build --watch
```

Output: `.dist/esp-js-di.js` (UMD), `.dist/esp-js-di.esm.mjs` (ESM). TypeScript declarations are hand-written in `esp-js-di.d.ts` (package root) — keep it in sync when changing the `Container` API.

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

Child containers prototypically inherit registrations from their parent, so a registration added to the parent later is visible in the child too. Registrations in the child shadow the parent. Disposing a child container disposes the instances it holds but does not affect the parent. Disposing a parent also disposes its child containers.

```javascript
const child = container.createChildContainer();
child.register('override', SpecialService).singleton();
const svc = child.resolve('myService'); // falls through to parent if not in child
child.dispose(); // disposes the instances the child holds
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
import di from 'esp-js-di';                    // default export is an object: di.Container
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
moduleContainer.dispose(); // calls LocalService's dispose() if it has one
```

**Check if registered:**
```javascript
if (!container.isRegistered('myService')) {
    container.register('myService', MyService).singleton();
}
```

## Gotchas

- **Registrations default to `singleton`, not transient** — call `.transient()` explicitly for per-resolve instances. The `RegistrationModifier` constructor sets singleton, and `register()` defaults the lifecycle to singleton
- The source is JavaScript, not TypeScript. Types live in the hand-written `esp-js-di.d.ts` — update it with any API change (e.g. `resolveMany`, `isDisposed`)
- `resolve()` throws if the name is not registered — check `isRegistered()` first if registration is optional
- `isRegistered()` / `isGroupRegistered()` search parent containers unless the options say `{searchParentContainers: false}` (`{}` searches parents)
- Re-registering a name is allowed (overrides the registration), but if a singleton for that name was already resolved, `resolve()` keeps returning the cached instance
- Container event handlers (`on('instanceRegistered' | 'instanceCreated')`) are shared by the whole container tree: a handler added on any container fires for registrations/creations in its parent and child containers too
- Circular dependency detection is runtime-only — cycles throw with a descriptive error
- Child containers use prototypal inheritance (`Object.create`) for `_registrations` — the prototype chain is live, so a child sees parent registrations, including ones added after the child was created
- `dispose()` on a container calls `dispose()` on every instance it holds in its own cache (not ones registered as externally owned) that has a `dispose` method — no interface needed. It then disposes its child containers
