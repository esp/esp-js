# esp-js-ui-rxcompat

## Package Purpose

Legacy RxJS 5/6 compatibility shims for `esp-js-rx`. Patches RxJS observables (via `Observable.prototype`) with the custom operators defined in `esp-js-rx`, using the RxJS 5/6 `rxjs-compat` lifting mechanism. This allows existing code written against the RxJS 5 operator chaining style (`observable.retryWithPolicy(...)`) to continue working without migration to pipeable operators.

**This package is for backwards compatibility only.** New code should use `esp-js-rx` operators directly with RxJS `pipe()`.

## Role in Monorepo

- **Depends on**: `esp-js`, `esp-js-rx`, `rxjs`, `rxjs-compat`
- No other esp-* packages depend on it — it is a leaf package
- Published as `esp-js-ui-rxcompat` on npm

## Build and Test

```bash
npm run build-dev
npm run build-prod
npm test
npm run test-ci
```

Output: `.dist/esp-js-ui-rxcompat.js`, `.dist/typings/index.d.ts`.

## Source Structure

```
src/
  index.ts              # Imports all shim files for side effects only — no named exports
  doOnSubscribe.ts      # Patches Observable.prototype.doOnSubscribe
  lazyConnect.ts        # Patches Observable.prototype.lazyConnect
  liftToEspObservable.ts  # Patches Observable.prototype.liftToEspObservable
  retryWithPolicy.ts    # Patches Observable.prototype.retryWithPolicy
  subscribeWithRouter.ts  # Patches Observable.prototype.subscribeWithRouter
  takeUntilInclusive.ts # Patches Observable.prototype.takeUntilInclusive
```

## Key Concepts

This package is **import-for-side-effects only**. Importing it patches the RxJS `Observable.prototype` using `rxjs-compat`'s `lift` mechanism so that chained-style calls work:

```typescript
import 'esp-js-ui-rxcompat'; // import once at app entry point

// Then existing code works:
someObservable
    .retryWithPolicy(policy)
    .doOnSubscribe(() => console.log('subscribed'))
    .takeUntilInclusive(stop$)
    .subscribe(handler);
```

Without the import, these prototype methods do not exist and the calls throw at runtime.

## Public API

The `index.ts` exports nothing (imports for side effects only). After importing, the patched methods are available on all RxJS `Observable` instances.

## Gotchas

- This package requires `rxjs-compat` to be installed — it will not work with RxJS 7+ where the compat layer was dropped
- Import this package exactly once, at the application entry point — importing it multiple times is safe but wasteful
- If you are writing new code, use `esp-js-rx` pipeable operators with `pipe()` instead
- TypeScript users will need to augment the `Observable` interface to get type-safe access to the patched methods (the patches add runtime methods but do not automatically extend TypeScript types)
