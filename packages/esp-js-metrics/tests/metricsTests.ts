import {MetricFactory} from '../src';

describe('metrics', () => {
    it('metrics implementation is defaulted', () => {
        let gaugeMetric = MetricFactory.createGauge('foo', 'bar');
        expect(gaugeMetric).toBeDefined();
    });
});