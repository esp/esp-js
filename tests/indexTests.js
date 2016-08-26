import espReact from '../src';
import {
    RouterProvider,
    SmartComponent,
    ViewBinder,
    viewBinding
} from '../src';

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
});