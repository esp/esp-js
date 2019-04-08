import { Router } from 'esp-js';
import { ComponentFactoryBase } from 'esp-js-ui';
import { BlotterState } from './models/blotterState';
import { BlotterModel } from './models/blotterModel';
export declare class BlotterComponentFactory extends ComponentFactoryBase<BlotterModel> {
    private _router;
    constructor(container: any, router: Router);
    _createComponent(childContainer: any, state: BlotterState): BlotterModel;
}
