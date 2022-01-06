// notice_start
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

import {NoopMetricsFactory} from './noopMetrics';
import {getMetricsFactoryInstance, setMetricsFactoryInstance} from './setImplementation';

// This is a pluggable API compatible with prom-client
// By default it runs on a no-operation (noop) implementation.
// The implementation can be swapped in very early on by calling MetricFactoryImplementation.set(impl).
// That will set an instance on global or window depending on if your running in node or a browser.
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

setMetricsFactoryInstance(NoopMetricsFactory, false);

export const MetricFactoryImplementation = {
    set(metricFactoryLike: MetricFactoryLike) {
        setMetricsFactoryInstance(metricFactoryLike, true);
    },
    unset() {
        setMetricsFactoryInstance(NoopMetricsFactory, true);
    }
};

export const MetricFactory: MetricFactoryLike = {
    createGauge(name: string, help: string, labelNames?: string[]): GaugeMetric {
        return getMetricsFactoryInstance().createGauge(name, help, labelNames);
    },
    createCounter(name: string, help: string, labelNames?: string []): CounterMetric {
        return getMetricsFactoryInstance().createCounter(name, help, labelNames);
    },
    createHistogram (name: string, help: string, labelNames?: string[], buckets?: number[]): HistogramMetric {
        return getMetricsFactoryInstance().createHistogram(name, help, labelNames, buckets);
    }
};