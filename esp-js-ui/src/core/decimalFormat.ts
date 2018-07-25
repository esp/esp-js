import Decimal from './decimal';

export default class DecimalFormat {
    public static ToString = (decimal: Decimal) => decimal.value.toFixed(decimal.scale);
    public static ToLocal = (decimal: Decimal) => decimal.value.toLocaleString();
}
