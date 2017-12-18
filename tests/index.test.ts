import espReact from '../src/index';
import {
    RouterProvider,
    SmartComponent,
    ViewBinder,
    viewBinding,
    ModelSelector,
    shouldUpdateMixin
} from '../src/index';

describe('index exports', () => {
    it('should export RouterProvider', () => {
        expect(espReact.RouterProvider).toBeDefined();
        expect(RouterProvider).toBeDefined();
    });

    it('should export SmartComponent', () => {
        expect(espReact.SmartComponent).toBeDefined();
        expect(SmartComponent).toBeDefined();
    });

    it('should export ViewBinder', () => {
        expect(espReact.ViewBinder).toBeDefined();
        expect(ViewBinder).toBeDefined();
    });

    it('should export viewBinding', () => {
        expect(espReact.viewBinding).toBeDefined();
        expect(viewBinding).toBeDefined();
    });

    it('should export ModelSelector', () => {
        expect(espReact.ModelSelector).toBeDefined();
        expect(ModelSelector).toBeDefined();
    });
});