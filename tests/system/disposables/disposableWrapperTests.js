import system from '../../../src/system';

var DisposableWrapper = system.disposables.DisposableWrapper;

describe('DisposableWrapper', () => {

    it('should accept functions as disposables', () => {
    	var isDisposed = false;
        var disposable = function() {
            isDisposed = true;
        };
        var disposableWrapper = new DisposableWrapper(disposable);
        disposableWrapper.dispose();
        expect(isDisposed).toEqual(true);
    });

    it('should accept objects with a dispose methods as disposables', () => {
        var disposable = {
            isDisposed: false,
            dispose: function() {
                this.isDisposed = true;
            }
        };
        var disposableWrapper = new DisposableWrapper(disposable);
        disposableWrapper.dispose();
        expect(disposable.isDisposed).toEqual(true);
    });

    it('should only dispose instances once', () => { // bit of a void test
        var disposeCount = 0;
        var disposable = new DisposableWrapper(() => { disposeCount++; });
        disposable.dispose();
        disposable.dispose();
        expect(disposeCount).toEqual(1);
    });

    it('should throw if undefined passed to ctor', () => {
    	expect(() => new DisposableWrapper(undefined)).toThrow();
    });

    it('should throw if null passed to ctor', () => {
        expect(() => new DisposableWrapper(null)).toThrow();
    });

    it('should throw if string passed to ctor', () => {
        expect(() => new DisposableWrapper("boo")).toThrow();
    });
});