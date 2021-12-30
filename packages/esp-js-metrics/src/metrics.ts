import {NoopMetricsFactory} from './noopMetrics';
import {GlobalState} from './globalState';

// This is a pluggable API compatible with prom-client
// By default it runs on a no-operation (noop) implementation.
// The implementation can be swapped in very early on by setting window.metricsFactoryInstance before any metrics are created.

export type LabelValues<T extends string = string> = Partial<Record<T, string | number>>;

export interface CounterMetric {
    inc(labels: LabelValues, value?: number): void;
    inc(value?: number): void;
    labels(...values: string[]): CounterMetricWithLabels;
    reset(): void;
    remove(...values: string[]): void;
}

export interface CounterMetricWithLabels {
    inc(value?: number): void;
}

export interface GaugeMetric {
    inc(labels: LabelValues, value?: number): void;
    inc(value?: number): void;
    dec(labels: LabelValues, value?: number): void;
    dec(value?: number): void;
    set(labels: LabelValues, value: number): void;
    set(value: number): void;
    setToCurrentTime(labels?: LabelValues): void;
    startTimer(labels?: LabelValues): (labels?: LabelValues) => void;
    labels(...values: string[]): GaugeMetricWithLabels;
    reset(): void;
    remove(...values: string[]): void;
}

export interface GaugeMetricWithLabels {
    inc(value?: number): void;
    dec(value?: number): void;
    set(value: number): void;
    setToCurrentTime(): void;
    startTimer(): (labels?: LabelValues) => void;
}

export interface HistogramMetric {
    observe(value: number): void;
    observe(labels: LabelValues, value: number): void;
    startTimer(labels?: LabelValues): (labels?: LabelValues) => void;
    reset(): void;
    labels(...values: string[]): HistogramMetricWithLabels;
    remove(...values: string[]): void;
}

export interface HistogramMetricWithLabels {
    observe(value: number): void;
    startTimer(): (Labels?: LabelValues) => void;
}

export interface MetricFactoryLike {
    createGauge(name: string, help: string, labelNames?: string[]): GaugeMetric;
    createCounter(name: string, help: string, labelNames?: string[]): CounterMetric;
    createHistogram(name: string, help: string, labelNames?: string[], buckets?: number[]): HistogramMetric;
}

declare global {
    interface Window {
        metricsFactoryInstance: MetricFactoryLike;
    }
    namespace NodeJS {
        interface Global {
            metricsFactoryInstance: MetricFactoryLike;
        }
    }
}

if (!GlobalState.metricsFactoryInstance) {
    GlobalState.metricsFactoryInstance = NoopMetricsFactory;
}

export const MetricFactoryImplementation = {
    set(metricFactoryLike: MetricFactoryLike) {
        GlobalState.metricsFactoryInstance = metricFactoryLike;
    }
};

export const MetricFactory: MetricFactoryLike = {
    createGauge(name: string, help: string, labelNames?: string[]): GaugeMetric {
        return GlobalState.metricsFactoryInstance.createGauge(name, help, labelNames);
    },
    createCounter(name: string, help: string, labelNames?: string []): CounterMetric {
        return GlobalState.metricsFactoryInstance.createCounter(name, help, labelNames);
    },
    createHistogram (name: string, help: string, labelNames?: string[], buckets?: number[]): HistogramMetric {
        return GlobalState.metricsFactoryInstance.createHistogram(name, help, labelNames, buckets);
    }
};