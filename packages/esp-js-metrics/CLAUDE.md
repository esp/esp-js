# esp-js-metrics

## Package Purpose

A thin pluggable metrics abstraction layer. Defines `Counter`, `Gauge`, `Histogram`, and `Summary` interfaces compatible with the [prom-client](https://github.com/siimon/prom-client) API. Ships with a no-op (noop) implementation by default. The implementation can be replaced at startup with a real metrics backend. Used internally by `esp-js-ui`'s `Shell` to track module and region loading events.

## Role in Monorepo

- **No dependencies** on other esp-* packages — fully standalone
- Depended on by: `esp-js-ui`
- Published as `esp-js-metrics` on npm

## Build and Test

```bash
npm run build-dev
npm run build-prod
npm test
npm run test-ci
```

Output: `.dist/esp-js-metrics.js` (UMD bundle), `.dist/typings/index.d.ts`.

## Source Structure

```
src/
  metrics.ts          # Metric interfaces (CounterMetric, GaugeMetric, etc.) + MetricFactory
  noopMetrics.ts      # NoopMetricsFactory — default no-op implementation
  setImplementation.ts  # getMetricsFactoryInstance() / setMetricsFactoryInstance() — global singleton accessor
  index.ts            # Re-exports all three modules
```

## Key Concepts and Patterns

### MetricFactory

`MetricFactory` is the primary entry point. It proxies to whichever implementation has been set globally:

```typescript
import {MetricFactory} from 'esp-js-metrics';

const counter = MetricFactory.getOrCreateCounter('my_counter', 'Description');
counter.inc();
counter.inc(5);

const gauge = MetricFactory.getOrCreateGauge('my_gauge', 'Description');
gauge.set(42);
gauge.inc();
gauge.dec();
```

### Plugging in a real implementation

At application startup, before any metrics are created:

```typescript
import {setMetricsFactoryInstance} from 'esp-js-metrics';
import promClient from 'prom-client';

setMetricsFactoryInstance(promClient); // must be prom-client compatible
```

The implementation is stored on `global` (Node) or `window` (browser) to survive module boundary issues.

### Noop default

If no implementation is set, all metric operations are no-ops. This means `esp-js-ui` works correctly with zero configuration — metrics are silently discarded unless a real implementation is injected.

## Public API

- `MetricFactory` — static methods: `getOrCreateCounter`, `getOrCreateGauge`, `getOrCreateHistogram`, `getOrCreateSummary`
- `CounterMetric`, `GaugeMetric`, `HistogramMetric`, `SummaryMetric` — interfaces
- `LabelValues` — type for label key-value pairs
- `setMetricsFactoryInstance()`, `getMetricsFactoryInstance()` — replace/read the global implementation

## Testing Approach

- No dedicated test files in this package (the noop implementation is straightforward)
- Integration is tested via `esp-js-ui` tests

## Gotchas

- The global implementation is stored on `global`/`window` — if multiple copies of `esp-js-metrics` are loaded (e.g. duplicate installs), `setMetricsFactoryInstance` and `getMetricsFactoryInstance` may see different globals. Ensure only one copy is installed.
- The interface is modelled after prom-client but is not identical — verify method signatures before substituting a real prom-client instance directly
