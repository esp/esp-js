import {StateSaveMonitor} from '../../../../src/ui/state/stateSaveMonitor';

describe('State Save Monitor', () => {
    let monitor: StateSaveMonitor;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(global, 'setInterval');
    });

    afterEach(() => {
        if (monitor) {
            monitor.dispose();
        }
    });

    it('Fires after interval', () => {
        const callback = jest.fn();
        monitor = new StateSaveMonitor(5, callback);
        monitor.start();
        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(callback).not.toBeCalled();
        jest.advanceTimersByTime(5);
        expect(callback).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('Starting twice has no effect', () => {
        const callback = jest.fn();
        monitor = new StateSaveMonitor(5, callback);
        monitor.start();
        monitor.start();
        expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it('Disposing remove subscription', () => {
        const callback = jest.fn();
        monitor = new StateSaveMonitor(5, callback);
        monitor.start();
        jest.advanceTimersByTime(5);
        expect(callback).toHaveBeenCalledTimes(1);
        monitor.dispose();
        jest.advanceTimersByTime(10);
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
