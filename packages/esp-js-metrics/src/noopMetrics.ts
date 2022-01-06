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

import {MetricFactoryLike, CounterMetric, GaugeMetric, HistogramMetric, LabelValues, GaugeMetricWithLabels, CounterMetricWithLabels, HistogramMetricWithLabels} from './metrics';

const NoopMetrics = (new class implements CounterMetric, GaugeMetric, HistogramMetric {
    inc(...args:any[]): void { }
    labels(...args: any[]): any {
        return NoopMetricsWithLabels;
    }
    remove(...args:any[]) { }
    reset() { }
    observe(...args:any[]) { }
    dec(labels: LabelValues, value?: number): void;
    dec(value?: number): void;
    dec(...args:any[]) {}
    set(...args:any[]) {}
    startTimer(labels?: LabelValues) { return () => {}; }
    setToCurrentTime(...args:any[])  { }
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