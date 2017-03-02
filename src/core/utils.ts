export default class Utils {
    static parseBool(input: string): boolean {
        if (input === null || typeof input === 'undefined') {
            return false;
        }
        switch (input.toLowerCase()) {
            case 'true':
                return true;
            case 'false':
                return false;
            default:
                return false;
        }
    };
    static isString(value: any) {
        return typeof value === 'string' || value instanceof String;
    }
    static isInt(n: number|string) {
        return Number(n) % 1 === 0;
    }
}
