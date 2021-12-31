import {CounterMetric, GaugeMetric, HistogramMetric, LabelValues, MetricFactoryLike} from 'esp-js-metrics';
import {CounterMetricWithLabels, GaugeMetricWithLabels, HistogramMetricWithLabels} from 'esp-js-metrics/src';

export class TestMetric implements CounterMetric, GaugeMetric, HistogramMetric {
    public incCalls: any[] = [];
    public setCalls: any[] = [];
    constructor(public name: string, public help: string, public labelNames?: string[], public buckets?: number[]) {
    }
    inc(...args:any[]): void {
        this.incCalls.push(args);
    }
    labels(...args: any[]): any {
        return new TestMetricsWithLabels();
    }
    remove(...ars:any[]) { }
    reset() { }
    observe(...ars:any[]) { }
    dec(labels: LabelValues, value?: number): void;
    dec(value?: number): void;
    dec(...args:any[]) {}
    set(...args:any[]) {
        this.setCalls.push(args);
    }
    startTimer(labels?: LabelValues) { return () => {}; }
    setToCurrentTime(...ars:any[])  { }
}

export class TestMetricsWithLabels implements CounterMetricWithLabels, GaugeMetricWithLabels, HistogramMetricWithLabels {
    inc(value?: number) { }
    dec(value?: number) { }
    set(value: number) { }
    observe(value: number) { }
    startTimer() { return () => {}; }
    setToCurrentTime() { }
}

export class TestMetricFactory implements MetricFactoryLike {
    public metricsByName: Map<string, TestMetric> = new Map<string, TestMetric>();

    createCounter(name: string, help: string, labelNames?: string[]): CounterMetric {
        return this._createAndStoreMetric(name, help, labelNames);
    }

    createGauge(name: string, help: string, labelNames?: string[]): GaugeMetric {
        return this._createAndStoreMetric(name, help, labelNames);
    }

    createHistogram(name: string, help: string, labelNames?: string[], buckets?: number[]): HistogramMetric {
        return this._createAndStoreMetric(name, help, labelNames, buckets);
    }
    private _createAndStoreMetric(name: string, help: string, labelNames?: string[], buckets?: number[]) {
        let metric = new TestMetric(name, help, labelNames, buckets);
        this.metricsByName.set(name, metric);
        return metric;
    }
}