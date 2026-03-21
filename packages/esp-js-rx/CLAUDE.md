# esp-js-rx

## Package Purpose

RxJS operator utilities and reactive primitives for use with ESP. Provides custom RxJS operators (retry with policy, lazy connect, `doOnSubscribe`, `takeUntilInclusive`, etc.), scheduler utilities, and disposable helpers that integrate with ESP's `DisposableBase` lifecycle. Used by `esp-js-ui` and available for application code that combines ESP with RxJS pipelines.

## Role in Monorepo

- **Depends on**: `esp-js`, `rxjs`
- Depended on by: `esp-js-ui`, `esp-js-ui-rxcompat`
- Published as `esp-js-rx` on npm

## Build and Test

```bash
npm run build-dev
npm run build-prod
npm test
npm run test-ci
```

Output: `.dist/esp-js-rx.js`, `.dist/typings/index.d.ts`.

## Source Structure

```
src/
  index.ts         # Re-exports all sub-modules
  operators/
    index.ts
    doOnSubscribe.ts        # operator: run callback on subscribe
    espObservable.ts        # liftToEspObservable — wraps RxJS observable with ESP Observable API
    lazyConnect.ts          # operator: defer connection until first subscriber
    retryPolicy.ts          # RetryPolicy type definition
    retryWithPolicy.ts      # operator: retry with configurable backoff/limit
    takeUntilInclusive.ts   # operator: takeUntil but includes the terminating value
    throwIf.ts              # operator: throw if predicate returns true
    throwOnSignal.ts        # operator: throw when a signal observable emits
  schedulers/
    index.ts
    (scheduler utilities for testing and production)
  disposables/
    index.ts
    SerialDisposable.ts     # Disposable that disposes the previous when a new one is set
  unit.ts                  # Unit type (void-like sentinel value)
```

## Key Concepts and Patterns

### Custom operators

All operators follow standard RxJS pipeable operator signature `(source: Observable<T>) => Observable<R>`:

```typescript
import { retryWithPolicy, doOnSubscribe, takeUntilInclusive, throwIf } from 'esp-js-rx';

source$.pipe(
    doOnSubscribe(() => console.log('subscribed')),
    retryWithPolicy(myRetryPolicy),
    takeUntilInclusive(stop$),
    throwIf(value => value === null, () => new Error('null not allowed'))
);
```

### RetryPolicy

```typescript
import { RetryPolicy } from 'esp-js-rx';

const policy: RetryPolicy = {
    maxRetryAttempts: 3,
    scalingDuration: 1000, // ms
    shouldRetry: (error) => true
};
```

### SerialDisposable

A `Disposable` that holds at most one inner disposable. Setting a new inner value disposes the previous:

```typescript
import { SerialDisposable } from 'esp-js-rx';

const serial = new SerialDisposable();
serial.setDisposable(subscription1); // subscription1 kept
serial.setDisposable(subscription2); // subscription1 disposed, subscription2 kept
serial.dispose();                    // subscription2 disposed
```

Used in `esp-js-ui`'s `Shell` to manage module load stream subscriptions.

### liftToEspObservable

Converts an RxJS observable to ESP's built-in `Observable` type (for interop with router observation APIs that expect ESP `Observable`):

```typescript
import { liftToEspObservable } from 'esp-js-rx';

const espObs = liftToEspObservable(rxjsObservable$);
router.getModelObservable('id'); // returns ESP Observable, not RxJS
```

## Public API

Exports from `src/index.ts`:
- Operators: `doOnSubscribe`, `lazyConnect`, `retryWithPolicy`, `takeUntilInclusive`, `throwIf`, `throwOnSignal`, `liftToEspObservable` (as `espObservable`)
- `RetryPolicy`
- `SerialDisposable`
- `unit` (Unit type sentinel)
- Scheduler utilities (from `schedulers/`)

## Testing Approach

- Test files: `tests/**/*Tests.ts`
- Tests use RxJS `TestScheduler` and marble testing patterns where applicable

## Common Tasks

**Retry HTTP calls with backoff:**
```typescript
httpClient.get('/api/data').pipe(
    retryWithPolicy({ maxRetryAttempts: 3, scalingDuration: 500 })
);
```

**Unsubscribe when a model is disposed:**
```typescript
// takeUntilInclusive emits the stop value before completing
source$.pipe(takeUntilInclusive(model.disposed$)).subscribe(handler);
```

**Use SerialDisposable to manage re-subscribable streams:**
```typescript
const serial = new SerialDisposable();
this.addDisposable(serial); // register with parent's lifecycle

function reconnect() {
    serial.setDisposable(source$.subscribe(handler)); // auto-disposes previous subscription
}
```

## Gotchas

- `liftToEspObservable` wraps an RxJS observable in ESP's Observable — the result is not an RxJS observable and cannot be composed with RxJS `.pipe()`
- `takeUntilInclusive` differs from RxJS `takeUntil` in that the terminating emission is forwarded to subscribers before completion — useful when the stop value carries meaningful data
- `SerialDisposable` is not thread-safe — only use on the JS event loop (not across Web Workers)
