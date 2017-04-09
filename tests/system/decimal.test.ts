import Decimal from '../../src/core/decimal';
describe('Decimal', () => {

    beforeEach(() => {

    });

    describe('parse', () => {
        it('returns null when passed invalid value', () => {
            expect(Decimal.parse({})).toEqual(null);
            expect(Decimal.parse('keith')).toEqual(null);
            expect(Decimal.parse('kei.0.th')).toEqual(null);
            expect(Decimal.parse('0.0.0')).toEqual(null);
        });

        it('captures scale correctly', () => {
            assertDecimal(Decimal.parse('0.0000'), 0, 4);
            assertDecimal(Decimal.parse(0.0000), 0, 0);

            assertDecimal(Decimal.parse('123.0000'), 1230000, 4);
            assertDecimal(Decimal.parse(123.0000), 123, 0);

            assertDecimal(Decimal.parse('123.0010'), 1230010, 4);
            assertDecimal(Decimal.parse(123.0010), 123001, 3);

            assertDecimal(Decimal.parse('1234'), 1234, 0);
            assertDecimal(Decimal.parse(1234), 1234, 0);
        });

        function assertDecimal(decimal:Decimal, expectedUnscaledValue:number, expectedScale:number) {
            expect(decimal.unscaledValue).toEqual(expectedUnscaledValue);
            expect(decimal.scale).toEqual(expectedScale);
        }
    });
});
