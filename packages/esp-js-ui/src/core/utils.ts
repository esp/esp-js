export const parseBool = (input: string): boolean => {
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

export const isString = (value: any) => {
    return typeof value === 'string' || value instanceof String;
};

export const isInt = (n: number|string) => {
    return Number(n) % 1 === 0;
};