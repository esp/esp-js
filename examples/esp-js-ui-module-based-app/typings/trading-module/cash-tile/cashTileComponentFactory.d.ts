import { Router } from 'esp-js';
import { PolimerModel } from 'esp-js-polimer';
import { ComponentFactoryBase } from 'esp-js-ui';
import { CashTileModel } from './model/cashTileModel';
export declare class CashTileComponentFactory extends ComponentFactoryBase<PolimerModel<CashTileModel>> {
    private _router;
    constructor(container: any, router: Router);
    _createComponent(childContainer: any, state: CashTileModel): PolimerModel<CashTileModel>;
}
