import {MetricFactoryLike, CounterMetric, GaugeMetric, HistogramMetric, LabelValues, GaugeMetricWithLabels, CounterMetricWithLabels, HistogramMetricWithLabels} from './metrics';

const NoopMetrics = (new class implements CounterMetric, GaugeMetric, HistogramMetric {
    inc(...ars:any[]): void { }
    labels(...args: any[]): any {
        return NoopMetricsWithLabels;
    }
    remove(...ars:any[]) { }
    reset() { }
    observe(...ars:any[]) { }
    dec(labels: LabelValues, value?: number): void;
    dec(value?: number): void;
    dec(...args:any[]) {}
    set(...args:any[]) {}
    startTimer(labels?: LabelValues) { return () => {}; }
    setToCurrentTime(...ars:any[])  { }
});

const NoopMetricsWithLabels = (new class implements CounterMetricWithLabels, GaugeMetricWithLabels, HistogramMetricWithLabels {
    inc(value?: number) { }
    dec(value?: number) { }
    set(value: number) { }
    observe(value: number) { }
    startTimer() { return () => {}; }
    setToCurrentTime() { }
});

export const NoopMetricsFactory: MetricFactoryLike = {
    createCounter(name: string, help: string, labelNames?: string[]): CounterMetric {
        return NoopMetrics;
    },
    createGauge(name: string, help: string, labelNames?: string[]): GaugeMetric {
        return NoopMetrics;
    },
    createHistogram(name: string, help: string, labelNames?: string[], buckets?: number[]): HistogramMetric {
        return NoopMetrics;
    }
};