# esp-js-perf-test

## Package Purpose

Internal performance benchmarks for `esp-js` and `esp-js-polimer`. Not published to npm (`"private": true`). Used for profiling and regression testing of core router and polimer dispatch performance. Runs via `ts-node` rather than webpack.

## Role in Monorepo

- **Depends on**: `esp-js`, `esp-js-polimer` (pinned to next pre-release versions)
- Not published — private, internal tooling
- Does not participate in the standard `lerna run test` suite (`test-ci` echoes "no tests to run")

## Build and Run

```bash
yarn build-dev    # webpack build (for bundled benchmarks)
yarn start        # ts-node src/index.ts  — run benchmarks directly
```

No `build-pack` or publish scripts.

## Source Structure

```
src/
  index.ts    # Entry point — runs all benchmarks
```

## Common Tasks

**Run the benchmarks:**
```bash
cd packages/esp-js-perf-test
yarn start
```

## Gotchas

- Version is pinned to `^8.1.1-next.0` (pre-release) while published packages are at `8.1.0` — this is expected; the perf test package tracks the cutting edge of the monorepo
- No test files — `yarn test-ci` is a no-op
- Not included in the root `yarn test` run for the same reason
