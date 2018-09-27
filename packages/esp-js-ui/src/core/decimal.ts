import *  as Utils from './utils';
import {Guard} from 'esp-js';
import {DecimalFormat} from './decimalFormat';

export class Decimal {
    private _unscaledValue: number;
    private _scale: number;

    static parse(value: any): Decimal {
        if (isNaN(value)) {
            return null;
        }
        let x = Utils.isString(value)
            ? value // preserve any trailing zeros
            : parseFloat(value) + ''; // removes any trailing zeros
        let indexOfPoint = x.indexOf('.');
        if (indexOfPoint === -1) {
            return new Decimal(Number(x), 0);
        }
        return new Decimal(
            Number(x.replace('.', '')),
            x.length - 1 - indexOfPoint
        );
    }

    constructor(unscaledValue: number, scale = 0) {
        Guard.isTruthy(Utils.isInt(unscaledValue), 'unscaledValue must be an int');
        Guard.isTruthy(Utils.isInt(scale), 'scale must be an int');
        this._unscaledValue = unscaledValue;
        this._scale = scale;
    }

    get unscaledValue(): number {
        return this._unscaledValue;
    }

    get scale(): number {
        return this._scale;
    }

    get value(): number {
        let pip = 1 / Math.pow(10, this._scale);
        return Number((this._unscaledValue * pip).toFixed(this._scale));
    }

    format(formatter?: (decimal: Decimal) => string): string {
        if (formatter) {
            return formatter(this);
        } else {
            return DecimalFormat.ToString(this);
        }
    }
}
